'use strict';
/**
 * Internal dependencies
 */
import { createPlugin } from './create-plugin.js';
import { toUpperCamelCase } from '../string/to-upper-camel-case.js';

/**
 * Creates a plugin controller with `createPlugin()` and registers it on
 * `window.StorePress`, so other scripts can find it by name.
 *
 * It takes the same configuration as `createPlugin()` and returns the same
 * controller. The difference is that the controller is also stored at
 * `window.StorePress.$Plugins[ Name ].Plugin`, where `Name` is the namespace in
 * UpperCamelCase (`'product-slider'` becomes `ProductSlider`). Themes, add-ons
 * and inline scripts can then call `init()`, `destroy()` or `get()` without
 * importing the plugin bundle, using `getStorePressPlugin( 'product-slider' )`.
 *
 * Resulting layout:
 *
 * ```
 * window.StorePress.$Plugins.ProductSlider = {
 *   Plugin:   <controller>, // set by this function
 *   Instance: WeakMap,      // element => instance, created on first init
 * }
 * ```
 *
 * Notes:
 * - Registering the same namespace again replaces the stored controller. Call
 *   `clear()` on the old one first, or its document listeners stay active.
 * - The controller is registered but not set up. Call `setup()` and `init()`.
 * - `getStorePressPlugin()` returns an empty placeholder `{}` if it runs before
 *   this function. Registration then replaces the placeholder, so a reference
 *   taken earlier stays empty. Look the plugin up when you need it, not at load time.
 * - The namespace also sets the event names: `storepress:{namespace_in_snake_case}:init`.
 *
 * @param {Object}                                              config              - Same as `createPlugin()`.
 * @param {string|Element|Array<Element>|NodeList}              config.selector     - Default targets.
 * @param {Object}                                              [config.options={}] - Default settings for new instances.
 * @param {new ( element: Element, options: Object ) => Object} config.plugin       - Plugin class, called with `new plugin( element, settings )`.
 * @param {string}                                              config.namespace    - Unique plugin name, e.g. `'product-slider'`.
 * @param {{onSetup?: () => void, onClear?: () => void}}        [config.callback]   - Lifecycle callbacks, called with `this` set to the controller. `onSetup` runs at the end of `setup()`, `onClear` at the end of `clear()`.
 *
 * @return {Object} The plugin controller returned by `createPlugin()`.
 *
 * @example
 * // At a glance
 * const Slider = createStorePressPlugin( {
 *   selector: '.product-slider',
 *   options: { speed: 300 },
 *   plugin: ProductSlider,
 *   namespace: 'product-slider',
 * } );
 *
 * window.StorePress.$Plugins.ProductSlider.Plugin === Slider; // true
 * getStorePressPlugin( 'product-slider' ) === Slider;         // true
 * Slider.setup();
 * Slider.init();
 *
 * @example
 * // Real-life use case: the entry file of a WooCommerce plugin
 * // assets/js/product-slider.js, enqueued with wp_enqueue_script().
 * import { createStorePressPlugin } from '@storepress/utils';
 * import { ProductSlider } from './ProductSlider';
 *
 * document.addEventListener( 'DOMContentLoaded', () => {
 *   const Slider = createStorePressPlugin( {
 *     selector: '.storepress-product-slider',
 *     options: window.StorePressProductSliderSettings, // wp_localize_script()
 *     plugin: ProductSlider,
 *     namespace: 'product-slider',
 *   } );
 *
 *   Slider.setup();
 *   Slider.init();
 * } );
 *
 * @example
 * // Real-life use case: an add-on plugin controls the slider
 * // The add-on is a separate bundle and does not import ProductSlider.
 * jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
 *   getStorePressPlugin( 'product-slider' ).init?.( '.mini-cart .storepress-product-slider' );
 * } );
 *
 * @example
 * // Real-life use case: a theme script without a build step
 * // Uses only the global object and the plugin's document events.
 * document.addEventListener( 'theme:tab-shown', ( event ) => {
 *   document.dispatchEvent(
 *     new CustomEvent( 'storepress:product_slider:reload', {
 *       detail: {
 *         element: event.target.querySelectorAll( '.storepress-product-slider' ),
 *         settings: window.StorePress.$Plugins.ProductSlider.Plugin.config.options,
 *       },
 *     } )
 *   );
 * } );
 *
 * @example
 * // Real-life use case: debugging in the browser console
 * const Slider = window.StorePress.$Plugins.ProductSlider.Plugin;
 * Slider.config;                 // { selector, options, callback }
 * Slider.get();                  // Every initialized slider
 * Slider.$event.get( document ); // The init, destroy and reload listeners
 *
 * @see createPlugin           The controller this function registers.
 * @see getStorePressPlugin    Reads the registered controller.
 * @see getPluginInstanceStore The instance store under the same namespace.
 */
export function createStorePressPlugin( {
	selector,
	options = {},
	plugin,
	namespace,
	callback = { onSetup: () => {}, onClear: () => {} },
} ) {
	const StorePressPlugin = createPlugin( {
		selector,
		options,
		plugin,
		namespace,
		callback,
	} );

	const name = toUpperCamelCase( namespace );

	// Ensure nested structure exists
	window.StorePress = window.StorePress || {};
	window.StorePress.$Plugins = window.StorePress.$Plugins || {};
	window.StorePress.$Plugins[ name ] =
		window.StorePress.$Plugins[ name ] || {};

	// Create if it doesn't exist
	if ( ! window.StorePress.$Plugins[ name ].Plugin ) {
		window.StorePress.$Plugins[ name ].Plugin = {};
	}

	window.StorePress.$Plugins[ name ].Plugin = StorePressPlugin;

	return StorePressPlugin;
}
