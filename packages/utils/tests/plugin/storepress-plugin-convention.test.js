/**
 * Tests for the StorePress plugin conventions described in the package README:
 * a plain plugin function managed by createStorePressPlugin, settings from
 * data-* attributes, the global registry, document lifecycle events, reset()
 * cleanup, and plugins built on createEventManager.
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createStorePressPlugin } from '../../src/plugin/create-storepress-plugin.js';
import { getPluginInstance } from '../../src/plugin/get-plugin-instance.js';
import { getStorePressPlugin } from '../../src/store/get-storepress-plugin.js';
import { getPluginInstanceStore } from '../../src/store/get-plugin-instance-store.js';
import { createEventManager } from '../../src/events/create-event-manager.js';
import { triggerEvent } from '../../src/events/trigger-event.js';
import { deepMerge } from '../../src/object/deep-merge.js';
import { getOptionsFromAttribute } from '../../src/dom/get-options-from-attribute.js';

/**
 * Plugin 1: the AbortController template (README "1. The plugin").
 *
 * Wrapped in a factory only so each test gets fresh module-level state;
 * in a real plugin everything above `function Plugin` sits at module level.
 */
function createTooltipModule() {
	const DEFAULTS = { position: 'top', offset: { x: 0, y: 8 } };
	const PRIVATE = { version: 1 };
	const ATTRIBUTE = 'storepress-tooltip'; // data-storepress-tooltip
	const CSS_CLASSES = [ 'storepress-tooltip-top', 'storepress-tooltip-bottom' ];
	const CSS_PROPERTIES = [ '--_tooltip-offset' ];

	const constructed = jest.fn();

	function Plugin( element, options ) {
		constructed( element, options );

		const settings = deepMerge(
			DEFAULTS,
			options,
			getOptionsFromAttribute( element, ATTRIBUTE ),
			PRIVATE
		);

		const controller = new AbortController();

		const removeStyles = () => {
			CSS_PROPERTIES.forEach( ( property ) =>
				element.style.removeProperty( property )
			);
		};

		const removeClasses = () => {
			element.classList.remove( ...CSS_CLASSES );
		};

		const show = () => {
			removeStyles();
			removeClasses();
			element.classList.add( `storepress-tooltip-${ settings.position }` );
			element.style.setProperty( '--_tooltip-offset', `${ settings.offset.y }px` );
		};

		const addEvents = () => {
			const { signal } = controller;
			element.addEventListener( 'pointerenter', show, { signal } );
			element.addEventListener( 'focusin', show, { signal } );
		};

		const reset = jest.fn( () => {
			removeStyles();
			removeClasses();
			controller.abort();
		} );

		addEvents();

		return { reset, settings, show };
	}

	return { Plugin, constructed, CSS_CLASSES };
}

/**
 * Plugin 2: the event manager template (README "Plugin with an event manager").
 */
function createSliderModule() {
	const EVENT_NAMESPACE = 'slider-ui';
	const events = createEventManager( EVENT_NAMESPACE );

	function Plugin( element, options ) {
		const settings = deepMerge(
			{ loop: true },
			options,
			getOptionsFromAttribute( element, 'storepress-slider' )
		);

		let index = 0;
		const getSlides = () => element.querySelectorAll( '.slide' );

		const goTo = ( newIndex ) => {
			const last = getSlides().length - 1;
			index = settings.loop
				? ( newIndex > last ? 0 : newIndex < 0 ? last : newIndex )
				: Math.min( Math.max( newIndex, 0 ), last );
			triggerEvent(
				element,
				`storepress:${ EVENT_NAMESPACE }:slide-change`,
				{ index },
				{ bubbles: true }
			);
		};

		const next = () => goTo( index + 1 );
		const prev = () => goTo( index - 1 );
		const getIndex = () => index;

		const handleClick = ( event ) => {
			const $button = event.target.closest( '.prev, .next' );
			if ( ! $button || ! element.contains( $button ) ) {
				return;
			}
			if ( $button.matches( '.next' ) ) {
				next();
			} else {
				prev();
			}
		};

		const handleGoTo = ( { detail } ) => goTo( detail.index );

		const handleKeydown = ( event ) => {
			if ( ! element.isConnected ) {
				reset();
				return;
			}
			if ( ! element.contains( document.activeElement ) ) {
				return;
			}
			if ( event.key === 'ArrowRight' ) {
				next();
			}
		};

		const reset = () => {
			events.removeAll( element );
			events.remove( document, 'keydown', handleKeydown );
		};

		events.add( element, 'click', handleClick );
		events.add( element, 'go-to', handleGoTo );
		events.add( document, 'keydown', handleKeydown );

		return { reset, next, prev, goTo, getIndex, settings };
	}

	return { Plugin, events };
}

// Wait for MutationObserver callbacks (autoRemove).
const flushObservers = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

const pressKey = ( $target, key ) =>
	$target.dispatchEvent( new KeyboardEvent( 'keydown', { key, bubbles: true } ) );

describe( 'StorePress plugin conventions', () => {
	describe( 'AbortController plugin', () => {
		const NAMESPACE = 'storepress-tooltip';
		let module;
		let Tooltip;
		let onSetup;
		let onClear;

		beforeEach( () => {
			document.body.innerHTML = `
				<button id="one" data-storepress-tooltip>One</button>
				<button id="two" data-storepress-tooltip='{"position": "bottom"}' data-storepress-tooltip--offset--y="20">Two</button>
				<button id="plain">No tooltip</button>
			`;
			module = createTooltipModule();
			onSetup = jest.fn();
			onClear = jest.fn();
			Tooltip = createStorePressPlugin( {
				selector: '[data-storepress-tooltip]',
				plugin: module.Plugin,
				namespace: NAMESPACE,
				options: {},
				callback: { onSetup, onClear },
			} );
			Tooltip.setup();
		} );

		afterEach( () => {
			Tooltip.clear();
		} );

		describe( 'create and register', () => {
			it( 'registers the manager on window.StorePress', () => {
				// The key is the namespace in UpperCamelCase: 'storepress-tooltip' => 'StorepressTooltip'.
				expect( window.StorePress.$Plugins.StorepressTooltip.Plugin ).toBe( Tooltip );
				expect( getStorePressPlugin( NAMESPACE ) ).toBe( Tooltip );
			} );

			it( 'runs onSetup with the manager as this', () => {
				expect( onSetup ).toHaveBeenCalledTimes( 1 );
				expect( onSetup.mock.contexts[ 0 ] ).toBe( Tooltip );
			} );

			it( 'creates no instances until init()', () => {
				expect( module.constructed ).not.toHaveBeenCalled();
				expect( Tooltip.get() ).toEqual( [] );
			} );
		} );

		describe( 'init and get', () => {
			it( 'creates one instance per matching element', () => {
				Tooltip.init();

				const instances = Tooltip.get();
				expect( instances ).toHaveLength( 2 );
				expect( instances.map( ( { element } ) => element.id ) ).toEqual( [ 'one', 'two' ] );
				expect( Tooltip.get( '#plain' ) ).toEqual( [] );
			} );

			it( 'returns the public API plus element and destroy', () => {
				Tooltip.init();

				const [ instance ] = Tooltip.get( '#one' );
				expect( Object.keys( instance ).sort() ).toEqual(
					[ 'destroy', 'element', 'reset', 'settings', 'show' ]
				);
				expect( instance.element ).toBe( document.getElementById( 'one' ) );
			} );

			it( 'shares instances with getPluginInstance and the instance store', () => {
				Tooltip.init();

				const [ instance ] = Tooltip.get( '#one' );
				const $one = document.getElementById( 'one' );
				expect( getPluginInstance( '#one', NAMESPACE )[ 0 ] ).toBe( instance );
				expect( getPluginInstanceStore( NAMESPACE ).get( $one ) ).toBe( instance );
				expect( window.StorePress.$Plugins.StorepressTooltip.Instance.get( $one ) ).toBe( instance );
			} );

			it( 'skips elements that already have an instance', () => {
				Tooltip.init();
				const [ first ] = Tooltip.get( '#one' );

				Tooltip.init();
				Tooltip.init( '#one' );

				expect( module.constructed ).toHaveBeenCalledTimes( 2 );
				expect( Tooltip.get( '#one' )[ 0 ] ).toBe( first );
			} );

			it( 'inits only the given selector', () => {
				Tooltip.init( '#two' );

				expect( Tooltip.get() ).toHaveLength( 1 );
				expect( Tooltip.get()[ 0 ].element.id ).toBe( 'two' );
			} );

			it( 'picks up elements added later (load more)', () => {
				Tooltip.init();
				document.body.insertAdjacentHTML( 'beforeend', '<button id="three" data-storepress-tooltip>Three</button>' );

				Tooltip.init();

				expect( Tooltip.get() ).toHaveLength( 3 );
				expect( module.constructed ).toHaveBeenCalledTimes( 3 );
			} );
		} );

		describe( 'settings', () => {
			it( 'merges DEFAULTS < options < data-* attributes < PRIVATE', () => {
				Tooltip.init( '[data-storepress-tooltip]', {
					position: 'left',
					offset: { x: 4 },
					version: 99,
				} );

				// #one has no attribute values: options override DEFAULTS, nested keys merge.
				expect( Tooltip.get( '#one' )[ 0 ].settings ).toEqual( {
					position: 'left',
					offset: { x: 4, y: 8 },
					version: 1, // PRIVATE always wins.
				} );

				// #two: JSON attribute and individual attributes beat options.
				expect( Tooltip.get( '#two' )[ 0 ].settings ).toEqual( {
					position: 'bottom',
					offset: { x: 4, y: 20 },
					version: 1,
				} );
			} );

			it( 'never changes DEFAULTS between instances', () => {
				Tooltip.init( '#one', { offset: { y: 50 } } );
				Tooltip.init( '#two' );

				expect( Tooltip.get( '#one' )[ 0 ].settings.offset.y ).toBe( 50 );
				expect( Tooltip.get( '#two' )[ 0 ].settings.offset ).toEqual( { x: 0, y: 20 } );
			} );
		} );

		describe( 'document events', () => {
			it( 'creates instances from a storepress:{namespace}:init event', () => {
				// The manager listens on document under the snake_case namespace.
				triggerEvent( document, 'storepress:storepress_tooltip:init', {
					element: '#one',
					settings: { position: 'right' },
				} );

				expect( Tooltip.get( '#one' )[ 0 ].settings.position ).toBe( 'right' );
			} );

			it( 'destroys and reloads from document events', () => {
				Tooltip.init();

				triggerEvent( document, 'storepress:storepress_tooltip:reload', {
					element: '#one',
					settings: { position: 'bottom' },
				} );
				expect( Tooltip.get( '#one' )[ 0 ].settings.position ).toBe( 'bottom' );

				triggerEvent( document, 'storepress:storepress_tooltip:destroy', { element: '#one' } );
				expect( Tooltip.get( '#one' ) ).toEqual( [] );
				expect( Tooltip.get( '#two' ) ).toHaveLength( 1 );
			} );
		} );

		describe( 'behavior', () => {
			it( 'applies classes and styles on pointerenter and focusin', () => {
				Tooltip.init();
				const $two = document.getElementById( 'two' );

				$two.dispatchEvent( new Event( 'pointerenter' ) );

				expect( $two.classList.contains( 'storepress-tooltip-bottom' ) ).toBe( true );
				expect( $two.style.getPropertyValue( '--_tooltip-offset' ) ).toBe( '20px' );

				const $one = document.getElementById( 'one' );
				$one.focus();
				expect( $one.classList.contains( 'storepress-tooltip-top' ) ).toBe( true );
			} );
		} );

		describe( 'destroy, reload and clear', () => {
			it( 'runs reset() and removes classes, styles and listeners on destroy()', () => {
				Tooltip.init();
				const $two = document.getElementById( 'two' );
				const [ instance ] = Tooltip.get( '#two' );
				$two.dispatchEvent( new Event( 'pointerenter' ) );

				Tooltip.destroy( '#two' );

				expect( instance.reset ).toHaveBeenCalledTimes( 1 );
				expect( Tooltip.get( '#two' ) ).toEqual( [] );
				expect( module.CSS_CLASSES.some( ( name ) => $two.classList.contains( name ) ) ).toBe( false );
				expect( $two.style.getPropertyValue( '--_tooltip-offset' ) ).toBe( '' );

				// Listeners are gone: hovering no longer adds the class.
				$two.dispatchEvent( new Event( 'pointerenter' ) );
				expect( $two.classList.contains( 'storepress-tooltip-bottom' ) ).toBe( false );

				// The other instance is untouched.
				expect( Tooltip.get( '#one' )[ 0 ].reset ).not.toHaveBeenCalled();
			} );

			it( 'runs reset() only once per instance', () => {
				Tooltip.init();
				const [ instance ] = Tooltip.get( '#one' );

				instance.destroy();
				instance.destroy();

				expect( instance.reset ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'replaces an instance with new settings on reload()', () => {
				Tooltip.init();
				const [ before ] = Tooltip.get( '#one' );

				Tooltip.reload( '#one', { position: 'left' } );
				const [ after ] = Tooltip.get( '#one' );

				expect( before.reset ).toHaveBeenCalledTimes( 1 );
				expect( after ).not.toBe( before );
				expect( after.settings.position ).toBe( 'left' );
			} );

			it( 'destroys everything and stops listening on clear()', () => {
				Tooltip.init();
				const instances = Tooltip.get();

				Tooltip.clear();

				instances.forEach( ( { reset } ) => expect( reset ).toHaveBeenCalledTimes( 1 ) );
				expect( Tooltip.get() ).toEqual( [] );
				expect( Tooltip.controller.signal.aborted ).toBe( true );
				expect( onClear.mock.contexts[ 0 ] ).toBe( Tooltip );

				// No document listeners left: init() does nothing until setup() runs again.
				Tooltip.init();
				expect( Tooltip.get() ).toEqual( [] );

				Tooltip.setup();
				Tooltip.init();
				expect( Tooltip.get() ).toHaveLength( 2 );
			} );
		} );
	} );

	describe( 'event manager plugin', () => {
		let module;
		let Slider;
		let $hero;
		let $second;

		const SLIDER = ( id, attribute = '' ) => `
			<div id="${ id }" data-storepress-slider${ attribute }>
				<div class="slide">1</div>
				<div class="slide">2</div>
				<div class="slide">3</div>
				<button class="prev">Prev</button>
				<button class="next">Next</button>
			</div>
		`;

		const getInstance = ( selector ) => Slider.get( selector )[ 0 ];

		beforeEach( () => {
			document.body.innerHTML = SLIDER( 'hero' ) + SLIDER( 'second', `='{"loop": false}'` );
			$hero = document.getElementById( 'hero' );
			$second = document.getElementById( 'second' );
			module = createSliderModule();
			Slider = createStorePressPlugin( {
				selector: '[data-storepress-slider]',
				plugin: module.Plugin,
				// Must differ from the event manager's namespace ('slider-ui').
				namespace: 'storepress-slider',
			} );
			Slider.setup();
			Slider.init();
		} );

		afterEach( () => {
			Slider.clear();
		} );

		it( 'uses a separate event namespace from the plugin manager', () => {
			const store = window.StorePress.$Events.StorePress;
			expect( store.has( 'storepress_slider' ) ).toBe( true ); // Manager: init, destroy, reload.
			expect( store.has( 'slider-ui' ) ).toBe( true ); // Plugin listeners.
		} );

		it( 'tracks listeners per element without duplicates', () => {
			Slider.init();

			const [ { $events } ] = module.events.getAll( $hero );
			expect( $events.map( ( { eventType } ) => eventType ) ).toEqual( [
				'storepress:slider-ui:click',
				'storepress:slider-ui:go-to',
			] );
			expect( $events.every( ( { size } ) => size === 1 ) ).toBe( true );

			// One document keydown handler per instance.
			expect( module.events.get( document )[ 0 ].$events[ 0 ].size ).toBe( 2 );
		} );

		it( 'handles delegated clicks and respects settings', () => {
			$hero.querySelector( '.prev' ).click();
			$second.querySelector( '.prev' ).click();

			expect( getInstance( '#hero' ).getIndex() ).toBe( 2 ); // loop
			expect( getInstance( '#second' ).getIndex() ).toBe( 0 ); // no loop
		} );

		it( 'handles keys only in the focused slider', () => {
			const $next = $hero.querySelector( '.next' );
			$next.focus();
			pressKey( $next, 'ArrowRight' );

			expect( getInstance( '#hero' ).getIndex() ).toBe( 1 );
			expect( getInstance( '#second' ).getIndex() ).toBe( 0 );
		} );

		it( 'announces slide-change to other scripts', () => {
			const listener = jest.fn();
			document.addEventListener( 'storepress:slider-ui:slide-change', listener );

			getInstance( '#hero' ).next();

			const [ event ] = listener.mock.calls[ 0 ];
			expect( event.target ).toBe( $hero );
			expect( event.detail ).toEqual( { index: 1 } );

			document.removeEventListener( 'storepress:slider-ui:slide-change', listener );
		} );

		it( 'accepts go-to from triggerEvent and from events.trigger', () => {
			triggerEvent( $hero, 'storepress:slider-ui:go-to', { index: 2 } );
			expect( getInstance( '#hero' ).getIndex() ).toBe( 2 );

			module.events.trigger( $hero, 'go-to', { index: 1 } );
			expect( getInstance( '#hero' ).getIndex() ).toBe( 1 );
		} );

		it( 'removes only its own listeners on destroy()', () => {
			Slider.destroy( '#hero' );

			expect( module.events.getAll( $hero ) ).toEqual( [] );
			expect( module.events.getAll( $second ) ).toHaveLength( 1 );
			expect( module.events.get( document )[ 0 ].$events[ 0 ].size ).toBe( 1 );

			// #second still works.
			$second.querySelector( '.next' ).click();
			expect( getInstance( '#second' ).getIndex() ).toBe( 1 );
		} );

		it( 'cleans up when markup is removed without destroy()', async () => {
			$hero.remove();
			await flushObservers();

			// autoRemove dropped the listeners on the removed element.
			expect( module.events.getAll( $hero ) ).toEqual( [] );

			// The document handler removes itself on the next key press.
			pressKey( document, 'ArrowRight' );
			expect( module.events.get( document )[ 0 ].$events[ 0 ].size ).toBe( 1 );
		} );
	} );
} );
