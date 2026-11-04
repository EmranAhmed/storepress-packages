'use strict';
/**
 * Internal dependencies
 */
import { toUpperCamelCase } from '../string/to-upper-camel-case.js';

/**
 * Returns the global Map that `createEventManager()` uses to track listeners
 * for one event prefix, creating it on first use.
 *
 * The store lives at `window.StorePress.$Events[ Name ]`, where `Name` is the
 * key in UpperCamelCase. `createEventManager()` calls it with its `prefix`
 * (default `'storepress'`, stored as `StorePress`; an empty prefix becomes
 * `'$global'`). Inside, each key is an event-manager namespace and each value is
 * a weak element store:
 *
 * ```
 * window.StorePress.$Events.StorePress = Map {
 *   'product_slider' => WeakElementMap { element => { eventName => Map { handler => AbortController } } },
 *   'cart'           => WeakElementMap { ... },
 * }
 * ```
 *
 * Because it is global, every event manager with the same prefix and namespace
 * shares listeners, even across separately bundled scripts. Use this function
 * to inspect that state while debugging. To add or remove listeners, use an
 * event manager, which keeps the store consistent.
 *
 * Notes:
 * - The outer Map holds namespace strings strongly, but the element stores inside
 *   hold elements weakly, so removed elements can still be garbage collected.
 * - Changing the Map directly (e.g. `delete`) skips the AbortControllers, so the
 *   listeners stay attached. Use `createEventManager( ns ).removeAll()` instead.
 * - The key is converted with `toUpperCamelCase()`: `'storepress'` → `StorePress`,
 *   `'my-shop'` → `MyShop`.
 * - It needs `window`, so it throws a ReferenceError without a DOM.
 *
 * @param {string} namespace - Store key. For event managers this is the event prefix, e.g. `'storepress'`.
 *
 * @return {Map<string, Object>} The shared Map of event-manager namespace => element store.
 *
 * @throws {ReferenceError} When `window` is not defined.
 *
 * @example
 * // At a glance
 * const store = getEventStore( 'storepress' );
 * store instanceof Map;                               // true
 * store === window.StorePress.$Events.StorePress;     // true
 * store === getEventStore( 'storepress' );            // true
 * [ ...store.keys() ];                                // [ 'product_slider', 'cart', ... ]
 *
 * @example
 * // Real-life use case: list which features have listeners on the page
 * // Run in the browser console on a product page.
 * console.table(
 *   [ ...getEventStore( 'storepress' ).keys() ].map( ( namespace ) => ( {
 *     namespace,
 *     elements: createEventManager( namespace ).getAll().length,
 *   } ) )
 * );
 *
 * @example
 * // Real-life use case: confirm cleanup after closing a quick view
 * jQuery( document.body ).on( 'quick-view-closed', () => {
 *   const leftovers = createEventManager( 'quick_view' )
 *     .getAll()
 *     .filter( ( { $element } ) => $element !== document && ! $element.isConnected );
 *
 *   if ( leftovers.length ) {
 *     console.warn( 'Quick view left listeners on removed elements:', leftovers );
 *   }
 * } );
 *
 * @example
 * // Real-life use case: a custom prefix keeps your listeners separate
 * createEventManager( 'cart', { prefix: 'my-shop' } );
 * getEventStore( 'my-shop' ).has( 'cart' );      // true once a listener is added
 * getEventStore( 'storepress' ).has( 'cart' );   // false
 *
 * @see createEventManager The only writer of this store.
 * @see getPluginInstanceStore The equivalent store for plugin instances.
 */
export function getEventStore( namespace ) {
	const name = toUpperCamelCase( namespace );

	// Ensure nested structure exists
	window.StorePress = window.StorePress || {};
	window.StorePress.$Events = window.StorePress.$Events || {};

	// Create Map if it doesn't exist
	if ( ! window.StorePress.$Events[ name ] ) {
		window.StorePress.$Events[ name ] = new Map();
	}
	return window.StorePress.$Events[ name ];
}
