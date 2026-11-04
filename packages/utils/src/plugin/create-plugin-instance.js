'use strict';
/**
 * Internal dependencies
 */
import { getElements } from '../dom/get-elements.js';
import { triggerEvent } from '../events/trigger-event.js';
import { getPluginInstanceStore } from '../store/get-plugin-instance-store.js';

/**
 * Creates one plugin instance per element and remembers it in the global
 * instance store, so each element only ever has one instance per namespace.
 *
 * For every element matched by `selectors`, it returns the stored instance if
 * there is one. Otherwise it calls `new plugin( element, options )`, adds two
 * properties to the result and stores it in
 * `window.StorePress.$Plugins[ Namespace ].Instance`:
 *
 * | Property           | Value                                                                           |
 * | ------------------ | ------------------------------------------------------------------------------- |
 * | `instance.element` | The element the instance belongs to.                                            |
 * | `instance.destroy` | Dispatches a non-bubbling `destroy` CustomEvent on the element, then removes the instance from the store. |
 *
 * This is the low-level building block behind `createPlugin()`. Use it directly
 * when you want per-element singletons without the document-event controller,
 * for example in a small script or a test.
 *
 * Notes:
 * - The `options` are only used when an instance is created. If the element
 *   already has an instance, it is returned unchanged and `options` is ignored.
 *   Destroy it first to apply new options.
 * - `instance.element` and `instance.destroy` are set after the constructor runs
 *   and overwrite properties of the same name. A `destroy()` method on the class
 *   is replaced. Listen for the element's `destroy` event to clean up instead
 *   (`createPlugin()` does this for you with `reset()`).
 * - The store is a WeakMap keyed by element. An instance is freed when its
 *   element is garbage collected, but its cleanup code never runs in that case.
 * - The namespace is converted with `toUpperCamelCase()`, so `'product-slider'`
 *   and `'ProductSlider'` share the same store.
 *
 * @param {string|Element|Document|Array<Element>|NodeList} selectors - Targets, as accepted by `getElements()`.
 * @param {Object}                                          options   - Second argument for the plugin constructor.
 * @param {Function}                                        plugin    - Plugin class, called with `new plugin( element, options )`.
 * @param {string}                                          namespace - Plugin namespace, e.g. `'product-slider'`.
 *
 * @return {Array<Object>} One instance per matched element, new or existing, in
 * document order. Empty when nothing matches.
 *
 * @example
 * // At a glance
 * const [ first ] = createPluginInstance( '.product-slider', { speed: 300 }, ProductSlider, 'product-slider' );
 * first.element;  // <div class="product-slider">
 * first.destroy;  // function: dispatches "destroy" on the element and forgets the instance
 *
 * createPluginInstance( '.product-slider', {}, ProductSlider, 'product-slider' )[ 0 ] === first; // true
 * createPluginInstance( '.missing', {}, ProductSlider, 'product-slider' ); // []
 *
 * @example
 * // Real-life use case: a "Read more" toggle on product descriptions
 * class ReadMore {
 *   constructor( element, { lines } ) {
 *     element.style.setProperty( '--lines', lines );
 *     this.button = element.querySelector( '.read-more' );
 *     this.toggle = () => element.classList.toggle( 'is-open' );
 *     this.button.addEventListener( 'click', this.toggle );
 *
 *     element.addEventListener(
 *       'destroy',
 *       () => this.button.removeEventListener( 'click', this.toggle ),
 *       { once: true }
 *     );
 *   }
 * }
 *
 * createPluginInstance( '.product-description', { lines: 4 }, ReadMore, 'read-more' );
 *
 * @example
 * // Real-life use case: safe re-init after a WooCommerce AJAX fragment refresh
 * // Old elements keep their instance; only new elements get one.
 * jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
 *   createPluginInstance( '.mini-cart .quantity', { min: 1 }, QuantityStepper, 'quantity-stepper' );
 * } );
 *
 * @example
 * // Real-life use case: apply new options to one element
 * // Existing instances ignore new options, so destroy first.
 * const [ instance ] = getPluginInstance( '#hero-slider', 'product-slider' );
 * instance?.destroy();
 * createPluginInstance( '#hero-slider', { speed: 600 }, ProductSlider, 'product-slider' );
 *
 * @example
 * // Real-life use case: testing a plugin class in Jest
 * document.body.innerHTML = '<div class="product-slider"></div>';
 * const [ slider ] = createPluginInstance( '.product-slider', { loop: true }, ProductSlider, 'test-slider' );
 *
 * expect( slider.element ).toBe( document.querySelector( '.product-slider' ) );
 * slider.destroy();
 * expect( getPluginInstance( '.product-slider', 'test-slider' ) ).toEqual( [] );
 *
 * @see createPlugin           Adds document events, defaults and `reset()` handling on top.
 * @see getPluginInstance      Reads stored instances without creating new ones.
 * @see getPluginInstanceStore The WeakMap behind this function.
 */
export function createPluginInstance( selectors, options, plugin, namespace ) {
	const store = getPluginInstanceStore( namespace );
	return Array.from( getElements( selectors ) ).map( ( element ) => {
		if ( store.has( element ) ) {
			return store.get( element );
		}
		const instance = new plugin( element, options );
		instance.element = element;
		instance.destroy = () => {
			triggerEvent( element, 'destroy' );
			store.delete( element );
		};
		store.set( element, instance );
		return instance;
	} );
}
