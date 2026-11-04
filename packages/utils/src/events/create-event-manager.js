'use strict';
/**
 * Internal dependencies
 */
import { getElement } from '../dom/get-element.js';
import { getElements } from '../dom/get-elements.js';
import { triggerEvent } from './trigger-event.js';
import { createWeakElementMap } from '../object/create-weak-element-map.js';
import { getEventStore } from '../store/get-event-store.js';

/**
 * Creates a namespaced manager that adds, replaces, triggers and removes DOM
 * event listeners, and cleans them up for you.
 *
 * Every listener gets its own `AbortController`, so it can be removed without
 * keeping a reference to the handler. Listeners are grouped by namespace, so
 * one `removeAll()` tears down a whole feature. Use one manager per plugin,
 * component, or plugin instance (a quick view modal, a mini-cart drawer, a
 * product slider) when you need guaranteed cleanup on destroy, or setup code
 * that can run again without stacking duplicate listeners.
 *
 * Event names:
 *
 * | You pass        | Treated as | Listener is attached to                          |
 * | --------------- | ---------- | ------------------------------------------------ |
 * | `'click'`       | Native     | `'click'`                                        |
 * | `'open'`        | Custom     | `'{prefix}{separator}{namespace}{separator}open'` |
 * | `'change'`      | Native     | `'change'` (it has an `onchange` property)       |
 *
 * An event is native when the element has an `on{type}` property
 * (`'onclick' in $element`). Everything else is custom. Custom events are
 * dispatched as a `CustomEvent` with your data in `event.detail`, and can be
 * heard with a plain `addEventListener( 'storepress:modal:open', ... )`.
 *
 * `add` vs `set`:
 *
 * | Situation                                  | `add`                     | `set`                     |
 * | ------------------------------------------ | ------------------------- | ------------------------- |
 * | Same inline arrow function, called 3 times | 3 handlers (duplicates)   | 1 handler                 |
 * | Same named function, called 3 times        | 1 handler (dupes ignored) | 1 handler                 |
 * | Two different handlers on one event        | Both run, in added order  | Only the last one runs    |
 * | Existing handlers in the same namespace    | Kept                      | Removed (same event only) |
 *
 * Store layout (global, shared between managers):
 * - `window.StorePress.$Events[ Prefix ]`: Map of namespace => element store.
 *   `Prefix` is the prefix in UpperCamelCase (`'storepress'` => `'StorePress'`).
 * - Element store: `createWeakElementMap()` of element => events object. Holds
 *   elements weakly but stays iterable for `getAll` and `removeAll`.
 * - Events object: full event name => Map of handler => AbortController.
 *
 * Memory safety, in two layers:
 * 1. `autoRemove` (MutationObserver): when an element with listeners is removed
 *    from the page, directly or with a parent, its listeners in this namespace
 *    are removed on the next microtask.
 * 2. Weak element store: frees what the observer cannot see (elements never
 *    appended, removed inside a shadow root, or with `autoRemove: false`) once
 *    the browser garbage collects them, as long as nothing else references them.
 *
 * Notes:
 * - Custom names that match a native handler property are treated as native:
 *   `'change'`, `'input'`, `'toggle'`, `'select'`, `'submit'`, `'load'`, ...
 *   `trigger` then dispatches a plain `Event` and `event.detail` is `undefined`.
 *   Pick names like `'slide-changed'` or `'variation-updated'` to pass data.
 * - Native events triggered with `trigger` ignore `eventDetails` and
 *   `triggerOptions`; they are dispatched as a bubbling, cancelable `Event`.
 * - Custom events don't bubble by default. Pass `{ bubbles: true }` as
 *   `triggerOptions` to listen on a parent.
 * - Matching is exact: `remove` or `trigger` for 'show' never touches 'shown'.
 * - Managers with the same prefix and namespace share listeners, so `set` and
 *   `removeAll` in one also affect the other. Use one namespace per feature.
 * - Targets must be HTML elements or `document`. `window` and SVG elements are
 *   not supported: `getElement` resolves them to `null`, so `add` and `set`
 *   throw `TypeError: WeakRef: invalid target`. Listen on `document` instead,
 *   or use plain `addEventListener` with an `AbortController`.
 * - `document` is never auto-removed, and elements that stay on the page keep
 *   their listeners. Still call `removeAll()` on destroy.
 * - The weak store cannot free an element that something else references: a
 *   `document` handler that uses it, your own arrays or Maps, or DevTools
 *   (`console.log( el )`, `$0`). Remove those references or call `remove( $element )`.
 * - With `autoRemove`, moving an element (removed and re-inserted in the same
 *   task, e.g. `prepend` or a sort) keeps its listeners. Detaching it and
 *   re-inserting it in a later task (after `await` or a timeout) loses them;
 *   pass `{ autoRemove: false }` for that pattern and clean up with `remove`.
 * - One MutationObserver per manager watches `document`. It starts on the first
 *   `add`/`set` and stops when the namespace has no elements left. It is skipped
 *   when `MutationObserver` is unavailable. The weak store requires `WeakRef`.
 *
 * @param {string}  namespace                     - Groups this manager's listeners, e.g. `'quick-view'`.
 * @param {Object}  [options={}]                  - Manager options.
 * @param {string}  [options.prefix='storepress'] - Prefix for custom event names and the global store key. An empty string falls back to `'$global'`.
 * @param {string}  [options.separator=':']       - Separator between prefix, namespace and event type. An empty string falls back to `':'`.
 * @param {boolean} [options.autoRemove=true]     - Remove an element's listeners automatically when it is removed from the page.
 *
 * @return {{
 *   add: Function,
 *   set: Function,
 *   trigger: Function,
 *   remove: Function,
 *   removeAll: Function,
 *   get: Function,
 *   getAll: Function
 * }} The event manager. Every method except `get` and `getAll` returns the manager, so calls can be chained.
 *
 * @example
 * // At a glance
 * const events = createEventManager( 'slider' ); // custom events: 'storepress:slider:{type}'
 * const cart = createEventManager( 'cart', { prefix: 'shop', separator: '.' } ); // 'shop.cart.{type}'
 *
 * events
 *   .add( '.slider-next', 'click', goNext )    // native 'click'
 *   .add( '.slider', 'slide-changed', onSlide ) // custom 'storepress:slider:slide-changed'
 *   .set( '#autoplay', 'click', toggleAutoplay ); // exactly one click handler
 *
 * events.trigger( '.slider', 'slide-changed', { index: 2 } ); // onSlide gets event.detail.index === 2
 * events.get( '#autoplay' )[ 0 ].$events;
 * // [ { eventType: 'storepress:slider:click', isNative: true, nativeType: 'click', size: 1 } ]
 * events.remove( '.slider-next', 'click', goNext ); // one handler
 * events.removeAll();                               // everything in 'slider'
 *
 * @example
 * // Real-life use case: quick view modal with full cleanup when it closes
 * class QuickView {
 *   constructor( $modal ) {
 *     this.$modal = $modal;
 *     this.events = createEventManager( 'quick-view' );
 *     this.events
 *       .add( $modal.querySelector( '.close' ), 'click', this.close )
 *       .add( document, 'keydown', this.onKeyDown );
 *   }
 *
 *   onKeyDown = ( event ) => event.key === 'Escape' && this.close();
 *
 *   close = () => {
 *     this.$modal.hidden = true;
 *     this.events.removeAll(); // the document keydown listener is gone too
 *   };
 * }
 *
 * @example
 * // Real-life use case: product grid re-rendered after AJAX filtering
 * // `set` keeps one handler per button however often render() runs, and
 * // autoRemove drops listeners of the cards that innerHTML replaced.
 * const grid = createEventManager( 'product-grid' );
 *
 * function render( html ) {
 *   document.querySelector( '.products' ).innerHTML = html;
 *   grid.set( '.products .add_to_cart_button', 'click', ( event ) => {
 *     event.preventDefault();
 *     addToCart( event.currentTarget.dataset.product_id );
 *   } );
 * }
 *
 * @example
 * // Real-life use case: variation events shared between modules
 * const variations = createEventManager( 'variation' );
 * const form = document.querySelector( '.variations_form' );
 *
 * variations.add( form, 'variation-updated', ( { detail } ) => {
 *   document.querySelector( '.price' ).innerHTML = detail.priceHtml;
 * } );
 *
 * // Elsewhere, after a variation is chosen:
 * variations.trigger( form, 'variation-updated', { variationId: 42, priceHtml: '<bdi>$19.00</bdi>' } );
 *
 * // A third-party script can listen without the manager:
 * form.addEventListener( 'storepress:variation:variation-updated', ( event ) => track( event.detail.variationId ) );
 *
 * @example
 * // Real-life use case: finding leaks from the browser console
 * const drawer = createEventManager( 'mini-cart' );
 *
 * // Elements still tracked although they left the page:
 * drawer.getAll().filter( ( { $element } ) => ! $element.isConnected );
 *
 * // Elements with duplicate handlers (an inline `add` that ran twice):
 * drawer.getAll().filter( ( { $events } ) => $events.some( ( { size } ) => size > 1 ) );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController AbortController
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver MutationObserver
 *
 * @since 0.13.0
 */
export function createEventManager( namespace, options = {} ) {
	const {
		prefix: userPrefix = 'storepress',
		separator: userSeparator = ':',
		autoRemove = true,
	} = options;
	const prefix = userPrefix || '$global';
	const separator = userSeparator || ':';
	const controllers = getEventStore( prefix );
	const canObserve = autoRemove && typeof MutationObserver !== 'undefined';
	let observer = null;

	/**
	 * Checks whether this namespace has no tracked elements left.
	 *
	 * Reads only the first live entry of the weak store instead of `size`,
	 * which would walk every entry. Garbage-collected elements are skipped.
	 *
	 * @private
	 *
	 * @return {boolean} `true` when the namespace is missing or has no elements.
	 *
	 * @example
	 * // Before any add
	 * _isEmpty(); // true
	 *
	 * @example
	 * // Used to decide whether the observer can stop
	 * if ( observer && _isEmpty() ) {
	 *   observer.disconnect();
	 * }
	 */
	const _isEmpty = () => {
		const elements = controllers.get( namespace );
		return ! elements || elements[ Symbol.iterator ]().next().done;
	};

	/**
	 * Removes all listeners from tracked elements that were removed from the page.
	 *
	 * The MutationObserver callback for `autoRemove`. An element counts as
	 * removed only when it is no longer connected AND it is one of the removed
	 * nodes or inside one. That keeps elements that were moved (re-inserted in
	 * the same task) and elements never added to the page. `document` and
	 * other non-element targets are always skipped.
	 *
	 * @private
	 *
	 * @param {MutationRecord[]} mutations - Records from the MutationObserver.
	 *
	 * @return {void}
	 *
	 * @example
	 * // Runs automatically; a removed cart row loses its listeners next microtask
	 * events.add( '.cart-item .remove', 'click', onRemoveItem );
	 * document.querySelector( '.cart-item' ).remove();
	 *
	 * @example
	 * // Moving an element keeps its listeners
	 * list.prepend( list.lastElementChild ); // still connected when the callback runs
	 */
	const _handleRemovedNodes = ( mutations ) => {
		const elements = controllers.get( namespace );
		if ( ! elements ) {
			return;
		}

		const $removedNodes = [];
		for ( const { removedNodes } of mutations ) {
			for ( const $node of removedNodes ) {
				if ( $node.nodeType === Node.ELEMENT_NODE ) {
					$removedNodes.push( $node );
				}
			}
		}

		if ( $removedNodes.length === 0 ) {
			return;
		}

		for ( const [ $element ] of [ ...elements ] ) {
			// Skip `document`, `window`, and still-attached elements.
			if (
				$element.nodeType !== Node.ELEMENT_NODE ||
				$element.isConnected
			) {
				continue;
			}
			const wasRemoved = $removedNodes.some(
				( $node ) => $node === $element || $node.contains( $element )
			);
			if ( wasRemoved ) {
				_remove( $element, null );
			}
		}
	};

	/**
	 * Starts watching `document` for removed elements, once per manager.
	 *
	 * Called from `_add`, so a manager that never adds a listener never
	 * observes. Does nothing when `autoRemove` is off, `MutationObserver` is
	 * unavailable, or the observer already runs.
	 *
	 * @private
	 *
	 * @return {void}
	 *
	 * @example
	 * events.add( '#mini-cart-toggle', 'click', toggleDrawer ); // observer starts here
	 *
	 * @example
	 * // No observer at all with autoRemove off
	 * createEventManager( 'tabs', { autoRemove: false } ).add( '.tab', 'click', showTab );
	 */
	const _startObserver = () => {
		if ( ! canObserve || observer ) {
			return;
		}
		observer = new MutationObserver( _handleRemovedNodes );
		observer.observe( document, { childList: true, subtree: true } );
	};

	/**
	 * Stops watching the page when this namespace has no elements left.
	 *
	 * Called after every removal path (`_remove`, `_forget`, `removeAll`) so an
	 * unused manager costs nothing. The next `add` or `set` starts it again.
	 *
	 * @private
	 *
	 * @return {void}
	 *
	 * @example
	 * events.remove( '#mini-cart-toggle' ); // last element: observer disconnects
	 *
	 * @example
	 * events.removeAll(); // namespace deleted: observer disconnects
	 */
	const _stopObserverIfEmpty = () => {
		if ( observer && _isEmpty() ) {
			observer.disconnect();
			observer = null;
		}
	};

	/**
	 * Attaches one handler to one element and records its AbortController.
	 *
	 * The single-element worker behind `add` and `set`. Creates the namespace
	 * and element entries when needed, stores the handler in a Map of
	 * handler => AbortController under the full event name, and attaches it to
	 * the native type or the full custom name. Adding the same handler to the
	 * same event twice is ignored, like native `addEventListener`. A
	 * `{ once: true }` handler is untracked after it runs.
	 *
	 * @private
	 *
	 * @param {string|Element|Document}  $target           - Target element or selector (first match).
	 * @param {string}                   eventType         - Event type, e.g. `'click'` or a custom name like `'open'`.
	 * @param {( event: Event ) => void} handler           - Listener function.
	 * @param {Object}                   [eventOptions={}] - `addEventListener` options (`once`, `passive`, `capture`). `signal` is set internally.
	 *
	 * @throws {TypeError} If the target resolves to `null` (no match, `window`, SVG element).
	 *
	 * @return {void}
	 *
	 * @example
	 * _add( button, 'click', onClick );
	 * _add( button, 'click', onClick );      // ignored, already attached
	 * _add( button, 'click', onOtherClick ); // button now has 2 click handlers
	 *
	 * @example
	 * _add( modal, 'open', onOpen ); // listens for 'storepress:quick-view:open'
	 */
	const _add = ( $target, eventType, handler, eventOptions = {} ) => {
		const $element = getElement( $target );
		if ( ! controllers.has( namespace ) ) {
			// Elements are held weakly: an element dropped without cleanup is
			// garbage collected together with its listeners.
			controllers.set( namespace, createWeakElementMap() );
		}
		if ( ! controllers.get( namespace ).has( $element ) ) {
			controllers.get( namespace ).set( $element, {} );
		}
		const events = controllers.get( namespace ).get( $element );
		const eventName = `${ prefix }${ separator }${ namespace }${ separator }${ eventType }`;

		// One Map per event name: handler => AbortController.
		if ( ! events[ eventName ] ) {
			events[ eventName ] = new Map();
		}

		const handlers = events[ eventName ];

		// Same handler added twice: ignore it (matches native addEventListener).
		if ( handlers.has( handler ) ) {
			return;
		}

		const controller = new AbortController();
		handlers.set( handler, controller );

		const type = eventName.split( separator ).at( -1 );
		const getType = `on${ type }` in $element ? type : eventName;
		$element.addEventListener( getType, handler, {
			...eventOptions,
			signal: controller.signal,
		} );

		_startObserver();

		// Auto-untrack "once" listeners after they run.
		if ( eventOptions.once ) {
			$element.addEventListener(
				getType,
				() => _forget( $element, eventName, handler ),
				{ once: true, signal: controller.signal }
			);
		}
	};

	/**
	 * Removes a handler from the store without aborting it.
	 *
	 * Used for `{ once: true }` listeners, which the browser has already
	 * removed after they ran. Also deletes empty event entries and empty
	 * element entries so the element can be garbage collected.
	 *
	 * @private
	 *
	 * @param {Element|Document}         $element  - Element the handler was attached to.
	 * @param {string}                   eventName - Full event name, e.g. `'storepress:slider:click'`.
	 * @param {( event: Event ) => void} handler   - The handler to untrack.
	 *
	 * @return {void}
	 *
	 * @example
	 * // Called automatically after a once listener fires
	 * events.add( button, 'click', onFirstClick, { once: true } );
	 * button.click();   // onFirstClick runs, then _forget untracks it
	 * events.get( button ); // [ { $element: button, $events: [] } ]
	 *
	 * @example
	 * _forget( button, 'storepress:slider:click', onFirstClick );
	 */
	const _forget = ( $element, eventName, handler ) => {
		const events = controllers.get( namespace )?.get( $element );
		const handlers = events?.[ eventName ];
		if ( ! handlers ) {
			return;
		}
		handlers.delete( handler );
		if ( handlers.size === 0 ) {
			delete events[ eventName ];
		}
		if ( Object.keys( events ).length === 0 ) {
			controllers.get( namespace ).delete( $element );
		}

		_stopObserverIfEmpty();
	};

	/**
	 * Adds an event listener to one or more elements.
	 *
	 * Several handlers can listen to the same event; they run in the order
	 * they were added. Adding the same function reference twice is ignored.
	 * Use `add` with named functions, or in code that runs exactly once: an
	 * inline arrow function is a new function on every call, so running the
	 * same `add` line again stacks another handler. If the code can run
	 * again, use `set`.
	 *
	 * @function add
	 * @memberof createEventManager
	 *
	 * @param {string|Element|NodeList|Array|Document} $targets          - CSS selector, element, NodeList, array of elements, or `document`.
	 * @param {string}                                 eventType         - Event type, e.g. `'click'`, `'keydown'`, or a custom name like `'open'`.
	 * @param {( event: Event ) => void}               handler           - Listener function.
	 * @param {Object}                                 [eventOptions={}] - `addEventListener` options, e.g. `{ once: true, passive: true }`.
	 *
	 * @return {Object} The event manager, for chaining.
	 *
	 * @example
	 * // Two features on one button, chained
	 * events
	 *   .add( '.single_add_to_cart_button', 'click', trackAddToCart )
	 *   .add( '.single_add_to_cart_button', 'click', openMiniCart ); // both run, in this order
	 *
	 * @example
	 * // Listener options
	 * events.add( '.product-gallery', 'touchstart', onTouch, { passive: true } );
	 * events.add( '.store-notice', 'click', dismissNotice, { once: true } ); // untracked after it runs
	 */
	const add = ( $targets, eventType, handler, eventOptions = {} ) => {
		const $elements = getElements( $targets );
		$elements.forEach( ( $element ) => {
			_add( $element, eventType, handler, eventOptions );
		} );

		return manager;
	};

	/**
	 * Attaches a handler and removes every other handler of that event first.
	 *
	 * Only the given event on the given elements is replaced; other events
	 * are untouched. Use it in setup code that may run several times
	 * (re-render, AJAX reload) so inline handlers never stack, or to swap
	 * behavior by state. It also removes handlers attached with `add`
	 * elsewhere in the same namespace; keep those in a separate namespace.
	 *
	 * @function set
	 * @memberof createEventManager
	 *
	 * @param {string|Element|NodeList|Array|Document} $targets          - CSS selector, element, NodeList, array of elements, or `document`.
	 * @param {string}                                 eventType         - Event type, e.g. `'click'`.
	 * @param {( event: Event ) => void}               handler           - The only handler that should remain for this event.
	 * @param {Object}                                 [eventOptions={}] - `addEventListener` options.
	 *
	 * @return {Object} The event manager, for chaining.
	 *
	 * @example
	 * // Safe on every render: always exactly one handler
	 * function renderMiniCart( cart ) {
	 *   events.set( '.mini-cart .checkout', 'click', () => goToCheckout( cart ) );
	 * }
	 *
	 * @example
	 * // Pitfall: set also removes handlers added with add in the same namespace
	 * events.add( '#play', 'click', trackPlay );
	 * events.set( '#play', 'click', isPlaying ? pause : play ); // trackPlay is removed too
	 *
	 * // Fix: keep analytics in its own namespace
	 * createEventManager( 'analytics' ).add( '#play', 'click', trackPlay );
	 */
	const set = ( $targets, eventType, handler, eventOptions = {} ) => {
		const $elements = getElements( $targets );
		$elements.forEach( ( $element ) => {
			if ( controllers.has( namespace ) ) {
				_remove( $element, eventType );
			}
			_add( $element, eventType, handler, eventOptions );
		} );

		return manager;
	};

	/**
	 * Dispatches this manager's registered events on one element.
	 *
	 * The single-element worker behind `trigger`. A native event whose name
	 * matches `eventType` is dispatched as a bubbling, cancelable `Event`
	 * without details. Every other matching event is dispatched with
	 * `triggerEvent` as a `CustomEvent` under its full name, with the details
	 * in `event.detail`.
	 *
	 * Known issue: with `eventType` set to `null`, native events are also sent
	 * through `triggerEvent` under their full name (e.g. `'storepress:slider:click'`),
	 * which no native listener hears. So `trigger( $element )` fires custom
	 * events only.
	 *
	 * @private
	 *
	 * @param {Element|Document} $target             - Target element.
	 * @param {string|null}      eventType           - Event type to dispatch, or `null` for every registered event.
	 * @param {Object}           [eventDetails={}]   - Data for custom events, available as `event.detail`.
	 * @param {Object}           [triggerOptions={}] - CustomEvent options (`bubbles`, `cancelable`, `composed`).
	 *
	 * @return {void}
	 *
	 * @example
	 * _trigger( modal, 'open', { productId: 42 } ); // CustomEvent 'storepress:quick-view:open'
	 *
	 * @example
	 * _trigger( button, 'click' ); // new Event( 'click', { bubbles: true, cancelable: true } )
	 */
	const _trigger = (
		$target,
		eventType,
		eventDetails = {},
		triggerOptions = {}
	) => {
		const events = _getEvents( $target, eventType );
		const eventName = `${ prefix }${ separator }${ namespace }${ separator }${ eventType }`;
		for ( const [ event, isNative, type ] of events ) {
			const $element = getElement( $target );
			if ( isNative && eventName === event ) {
				$element.dispatchEvent(
					new Event( type, {
						bubbles: true,
						cancelable: true,
					} )
				);
			} else {
				triggerEvent( $element, event, eventDetails, triggerOptions );
			}
		}
	};

	/**
	 * Triggers events that were registered through this manager.
	 *
	 * Only events added in this namespace fire; an element without a matching
	 * registered event does nothing. Custom events carry `eventDetails` in
	 * `event.detail`. Native events (e.g. `'click'`) are dispatched as a plain
	 * bubbling `Event` and ignore `eventDetails` and `triggerOptions`, so use a
	 * custom name such as `'slide-changed'` to pass data. If nothing happens,
	 * check `get( $targets )` for the event.
	 *
	 * @function trigger
	 * @memberof createEventManager
	 *
	 * @param {string|Element|NodeList|Array|Document} $targets            - CSS selector, element, NodeList, array of elements, or `document`.
	 * @param {string|null}                            [eventType=null]    - Event type to trigger. `null` triggers every registered custom event on the element (native ones are skipped, see `_trigger`).
	 * @param {Object}                                 [eventDetails={}]   - Data for custom events, available as `event.detail`.
	 * @param {Object}                                 [triggerOptions={}] - CustomEvent options (`bubbles`, `cancelable`, `composed`). Custom events default to non-bubbling.
	 *
	 * @return {Object} The event manager, for chaining.
	 *
	 * @example
	 * // Custom event with data
	 * events.add( '.mini-cart', 'items-updated', ( { detail } ) => renderCount( detail.count ) );
	 * events.trigger( '.mini-cart', 'items-updated', { count: 3 } );
	 *
	 * @example
	 * // Native handler run from code, e.g. open the drawer after add-to-cart
	 * events.add( '.mini-cart-toggle', 'click', openDrawer );
	 * events.trigger( '.mini-cart-toggle', 'click' ); // openDrawer runs; the event bubbles
	 */
	const trigger = (
		$targets,
		eventType = null,
		eventDetails = {},
		triggerOptions = {}
	) => {
		if ( ! controllers.has( namespace ) ) {
			return manager;
		}
		const $elements = getElements( $targets );
		$elements.forEach( ( $element ) => {
			_trigger( $element, eventType, eventDetails, triggerOptions );
		} );

		return manager;
	};

	/**
	 * Lists the registered events on one element that match an event type.
	 *
	 * Used by `_trigger` to decide what to dispatch and whether each event is
	 * native or custom. Matching is exact: 'show' does not match 'shown'.
	 *
	 * @private
	 *
	 * @param {Element|Document} $target   - Target element (not a selector).
	 * @param {string|null}      eventType - Event type to match, or `null` for all events.
	 *
	 * @return {Array<[string, boolean, string]>} Tuples of `[ full event name, is native, short event type ]`.
	 *
	 * @example
	 * _getEvents( button, 'click' );
	 * // [ [ 'storepress:slider:click', true, 'click' ] ]
	 *
	 * @example
	 * _getEvents( modal, null );
	 * // [ [ 'storepress:slider:open', false, 'open' ], [ 'storepress:slider:close', false, 'close' ] ]
	 */
	const _getEvents = ( $target, eventType ) => {
		if ( ! controllers.get( namespace ).has( $target ) ) {
			return [];
		}
		const events = controllers.get( namespace ).get( $target );
		const available = [];
		const eventName = `${ prefix }${ separator }${ namespace }${ separator }${ eventType }`;
		if ( eventType === null ) {
			for ( const [ type ] of Object.entries( events ) ) {
				const event = type.split( separator ).at( -1 );
				const isNative = `on${ event }` in $target;
				available.push( [ type, isNative, event ] );
			}
			return available;
		}
		for ( const [ type ] of Object.entries( events ) ) {
			if ( type === eventName ) {
				const event = type.split( separator ).at( -1 );
				const isNative = `on${ event }` in $target;
				available.push( [ type, isNative, event ] );
			}
		}
		return available;
	};

	/**
	 * Removes listeners from one element by aborting their controllers.
	 *
	 * The single-element worker behind `remove`, `set`, `removeAll` and
	 * `autoRemove`. Cleans up empty event entries and drops the element from
	 * the store when it has no events left, so it can be garbage collected.
	 *
	 * @private
	 *
	 * @param {string|Element|Document}         $target        - Target element or selector (first match).
	 * @param {string|null}                     eventType      - Event type to remove, or `null` for every event.
	 * @param {( event: Event ) => void | null} [handler=null] - Handler to remove, or `null` for every handler of the event.
	 *
	 * @throws {Error} If the namespace does not exist in the store.
	 *
	 * @return {void}
	 *
	 * @example
	 * _remove( button, 'click', onClick ); // only onClick
	 * _remove( button, 'click' );          // every click handler
	 *
	 * @example
	 * _remove( button, null ); // every event on button; button leaves the store
	 */
	const _remove = ( $target, eventType, handler = null ) => {
		const $element = getElement( $target );
		if ( typeof controllers.get( namespace ) === 'undefined' ) {
			throw new Error(
				`Namespace: "${ namespace }" is not available in "${ prefix }" event map.`
			);
		}
		if ( ! controllers.get( namespace ).has( $element ) ) {
			return;
		}
		const events = controllers.get( namespace ).get( $element );
		const eventName = `${ prefix }${ separator }${ namespace }${ separator }${ eventType }`;

		for ( const [ type, handlers ] of Object.entries( events ) ) {
			if ( eventType !== null && type !== eventName ) {
				continue;
			}
			for ( const [ fn, controller ] of handlers ) {
				if ( handler === null || handler === fn ) {
					controller.abort();
					handlers.delete( fn );
				}
			}
			if ( handlers.size === 0 ) {
				delete events[ type ];
			}
		}

		// No events left: drop the element so it can be garbage collected.
		if ( Object.keys( events ).length === 0 ) {
			controllers.get( namespace ).delete( $element );
		}

		_stopObserverIfEmpty();
	};

	/**
	 * Removes listeners from one or more elements.
	 *
	 * Removes one handler, every handler of an event, or every event on the
	 * element, depending on the arguments. Matching is exact: removing
	 * `'click'` leaves `'clickout'` alone. Pass `handler` only when you kept
	 * the same function reference used in `add`; a new inline function never
	 * matches and the call does nothing. Does nothing when the namespace has
	 * no listeners yet.
	 *
	 * @function remove
	 * @memberof createEventManager
	 *
	 * @param {string|Element|NodeList|Array|Document} $targets         - CSS selector, element, NodeList, array of elements, or `document`.
	 * @param {string|null}                            [eventType=null] - Event type to remove. `null` removes every event on the element.
	 * @param {Function|null}                          [handler=null]   - Handler to remove (same reference used in `add`). `null` removes every handler of the event.
	 *
	 * @return {Object} The event manager, for chaining.
	 *
	 * @example
	 * // Turn off analytics, keep the mini-cart behavior
	 * events.remove( '.single_add_to_cart_button', 'click', trackAddToCart );
	 *
	 * @example
	 * // Every event on an element, or every handler of one event
	 * events.remove( '.product-gallery' );
	 * events.remove( document, 'keydown' );
	 */
	const remove = ( $targets, eventType = null, handler = null ) => {
		if ( ! controllers.has( namespace ) ) {
			return manager;
		}
		const $elements = getElements( $targets );
		$elements.forEach( ( $element ) => {
			_remove( $element, eventType, handler );
		} );

		return manager;
	};

	/**
	 * Removes every listener on every element in this namespace.
	 *
	 * Aborts all controllers, then deletes the namespace from the store. The
	 * manager stays usable: `add` and `set` recreate the namespace. Safe to
	 * call repeatedly. Managers with the same prefix and namespace share the
	 * store, so their listeners are removed too. Listeners added with plain
	 * `addEventListener` are not affected.
	 *
	 * @function removeAll
	 * @memberof createEventManager
	 *
	 * @return {Object} The event manager, for chaining.
	 *
	 * @example
	 * // Teardown when the mini-cart drawer is destroyed
	 * function destroyDrawer() {
	 *   drawerEvents.removeAll();
	 * }
	 *
	 * @example
	 * // Idempotent setup: running init() twice never doubles listeners
	 * function init() {
	 *   events
	 *     .removeAll()
	 *     .add( '.slider-next', 'click', goNext )
	 *     .add( document, 'keydown', onKeyDown );
	 * }
	 */
	const removeAll = () => {
		if ( ! controllers.has( namespace ) ) {
			return manager;
		}
		const events = controllers.get( namespace );
		for ( const [ $target ] of [ ...events ] ) {
			_remove( $target, null );
		}
		controllers.delete( namespace );
		_stopObserverIfEmpty();

		return manager;
	};

	/**
	 * Describes the registered events on one element.
	 *
	 * The single-element worker behind `get` and `getAll`.
	 *
	 * @private
	 *
	 * @param {string|Element|Document} $target - Target element or selector (first match).
	 *
	 * @throws {Error} If the namespace does not exist in the store.
	 *
	 * @return {Array<{eventType: string, isNative: boolean, nativeType: string, size: number}>}
	 * One entry per event: full event name, whether it is native, the native type (empty for custom events) and the number of handlers.
	 *
	 * @example
	 * _get( button );
	 * // [ { eventType: 'storepress:slider:click', isNative: true, nativeType: 'click', size: 2 } ]
	 *
	 * @example
	 * _get( untrackedElement ); // []
	 */
	const _get = ( $target ) => {
		const $element = getElement( $target );
		if ( typeof controllers.get( namespace ) === 'undefined' ) {
			throw new Error(
				`Namespace: "${ namespace }" is not available in "${ prefix }" event map.`
			);
		}
		if ( ! controllers.get( namespace ).has( $element ) ) {
			return [];
		}
		const events = controllers.get( namespace ).get( $element );
		const available = [];
		for ( const [ eventType, handlers ] of Object.entries( events ) ) {
			const last = eventType.split( separator ).at( -1 );
			const isNative = `on${ last }` in $element;
			available.push( {
				eventType,
				isNative,
				nativeType: isNative ? last : '',
				size: handlers.size,
			} );
		}
		return available;
	};

	/**
	 * Gets the registered events for one or more elements.
	 *
	 * Returns one entry per resolved element, including elements that have no
	 * events in this namespace (`$events: []`). Returns `[]` when the namespace
	 * has no listeners yet. Only listeners added through this namespace are
	 * reported, not plain `addEventListener` calls. A `size` above 1 after code
	 * ran twice usually means an inline handler was added with `add` where
	 * `set` was intended.
	 *
	 * @function get
	 * @memberof createEventManager
	 *
	 * @param {string|Element|NodeList|Array|Document} $targets - CSS selector, element, NodeList, array of elements, or `document`.
	 *
	 * @return {Array<{$element: Element, $events: Array<{eventType: string, isNative: boolean, nativeType: string, size: number}>}>} One entry per element.
	 *
	 * @example
	 * events.add( modal, 'open', onOpen );
	 * events.get( modal )[ 0 ].$events;
	 * // [ { eventType: 'storepress:quick-view:open', isNative: false, nativeType: '', size: 1 } ]
	 *
	 * @example
	 * // Bind once: skip when a click handler already exists
	 * const [ entry ] = events.get( '.mini-cart-toggle' );
	 * if ( ! entry?.$events.some( ( { nativeType } ) => nativeType === 'click' ) ) {
	 *   events.add( '.mini-cart-toggle', 'click', toggleDrawer );
	 * }
	 */
	const get = ( $targets ) => {
		if ( ! controllers.has( namespace ) ) {
			return [];
		}
		const $elements = getElements( $targets );
		const available = [];
		$elements.forEach( ( $element ) => {
			available.push( {
				$element,
				$events: _get( $element ),
			} );
		} );
		return available;
	};

	/**
	 * Gets every element and its registered events in this namespace.
	 *
	 * Meant for debugging, not hot paths, since it walks every element.
	 * Garbage-collected elements are skipped. An element with
	 * `isConnected === false` that stays listed is not collected yet or is
	 * still referenced somewhere else.
	 *
	 * @function getAll
	 * @memberof createEventManager
	 *
	 * @return {Array<{$element: Element, $events: Array<{eventType: string, isNative: boolean, nativeType: string, size: number}>}>} One entry per element in the namespace.
	 *
	 * @example
	 * // Console table of every listener in the namespace
	 * console.table(
	 *   events.getAll().flatMap( ( { $element, $events } ) =>
	 *     $events.map( ( e ) => ( { element: $element.id || $element.nodeName, ...e } ) )
	 *   )
	 * );
	 *
	 * @example
	 * // Clean up elements that left the page but are still tracked
	 * events
	 *   .getAll()
	 *   .filter( ( { $element } ) => ! $element.isConnected )
	 *   .forEach( ( { $element } ) => events.remove( $element ) );
	 */
	const getAll = () => {
		if ( ! controllers.has( namespace ) ) {
			return [];
		}
		const events = controllers.get( namespace );
		const available = [];
		for ( const [ $element ] of [ ...events ] ) {
			available.push( {
				$element,
				$events: _get( $element ),
			} );
		}
		return available;
	};

	const manager = {
		add,
		set,
		trigger,
		remove,
		removeAll,
		get,
		getAll,
	};

	return manager;
}
