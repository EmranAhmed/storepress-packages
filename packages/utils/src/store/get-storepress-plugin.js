'use strict';
/**
 * Internal dependencies
 */
import { toUpperCamelCase } from '../string/to-upper-camel-case.js';

/**
 * Returns the plugin controller registered on `window.StorePress` for a
 * namespace, or an empty placeholder object if none is registered yet.
 *
 * Reads `window.StorePress.$Plugins[ Name ].Plugin`, where `Name` is the
 * namespace in UpperCamelCase (`'product-slider'` becomes `ProductSlider`).
 * Controllers are put there by `createStorePressPlugin()`. This is how one
 * bundle talks to a plugin from another bundle without importing it.
 *
 * | State                                       | Result                              |
 * | ------------------------------------------- | ----------------------------------- |
 * | `createStorePressPlugin()` has already run  | The controller (`setup`, `init`, `get`, ...) |
 * | Not registered yet                          | `{}`, stored as a placeholder       |
 *
 * Notes:
 * - Never returns `undefined`, so check for a method before calling it:
 *   `getStorePressPlugin( 'product-slider' ).init?.()`.
 * - The placeholder `{}` is replaced, not filled, when the plugin registers.
 *   A reference saved before registration stays empty. Call this function at
 *   the moment you need the plugin instead of caching the result at load time.
 * - The namespace is converted with `toUpperCamelCase()`, so `'product-slider'`
 *   and `'ProductSlider'` return the same controller.
 * - It needs `window`, so it throws a ReferenceError without a DOM.
 *
 * @param {string} namespace - Plugin namespace, e.g. `'product-slider'`.
 *
 * @return {Object} The registered controller, or an empty object.
 *
 * @throws {ReferenceError} When `window` is not defined.
 *
 * @example
 * // At a glance
 * getStorePressPlugin( 'product-slider' ); // {} before registration
 *
 * const Slider = createStorePressPlugin( { selector: '.product-slider', plugin: ProductSlider, namespace: 'product-slider' } );
 * getStorePressPlugin( 'product-slider' ) === Slider;  // true
 * getStorePressPlugin( 'ProductSlider' ) === Slider;   // true (same name after conversion)
 *
 * @example
 * // Real-life use case: re-init another plugin after WooCommerce AJAX
 * // Your add-on loads new products; the slider plugin is a separate bundle.
 * jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
 *   getStorePressPlugin( 'product-slider' ).init?.();
 * } );
 *
 * @example
 * // Real-life use case: rebuild the slider when a variation is selected
 * jQuery( '.variations_form' ).on( 'found_variation', () => {
 *   const Slider = getStorePressPlugin( 'product-slider' );
 *   Slider.reload?.( '.woocommerce-product-gallery .product-slider' );
 * } );
 *
 * @example
 * // Real-life use case: feature detection before using a plugin's API
 * const Slider = getStorePressPlugin( 'product-slider' );
 * if ( typeof Slider.get === 'function' ) {
 *   Slider.get( '#hero-slider' )[ 0 ]?.pause();
 * } else {
 *   console.warn( 'Product Slider is not active on this page.' );
 * }
 *
 * @see createStorePressPlugin Registers the controller this function reads.
 * @see getPluginInstanceStore The instance store under the same namespace.
 */
export function getStorePressPlugin( namespace ) {
	const name = toUpperCamelCase( namespace );

	window.StorePress = window.StorePress || {};
	window.StorePress.$Plugins = window.StorePress.$Plugins || {};
	window.StorePress.$Plugins[ name ] = window.StorePress.$Plugins[ name ] || {};

	// Create if it doesn't exist
	if ( ! window.StorePress.$Plugins[ name ].Plugin ) {
		window.StorePress.$Plugins[ name ].Plugin = {};
	}

	return window.StorePress.$Plugins[ name ].Plugin;
}
