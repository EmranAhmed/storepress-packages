'use strict';

/**
 * Internal dependencies
 */
import { toUpperCamelCase } from '../string/to-upper-camel-case.js';

/**
 * Returns the global WeakMap that holds plugin instances for a namespace,
 * creating it on first use.
 *
 * The store lives at `window.StorePress.$Plugins[ Name ].Instance`, where `Name`
 * is the namespace in UpperCamelCase (`'product-slider'` becomes `ProductSlider`).
 * Keys are DOM elements and values are plugin instances. Because it is on
 * `window`, every bundle on the page that uses the same namespace shares it,
 * even when each bundle ships its own copy of `@storepress/utils`.
 *
 * Most code does not need this directly: `createPluginInstance()` writes to it
 * and `getPluginInstance()` reads from it. Use it for low-level checks, custom
 * instance management, or tests.
 *
 * Notes:
 * - A WeakMap holds its keys weakly. When an element is removed from the page and
 *   nothing else references it, the entry (and the instance) can be garbage
 *   collected. The instance referencing its own element does not prevent this.
 * - A WeakMap cannot be iterated or counted. To find instances, query elements
 *   and check each one with `has()` or `getPluginInstance()`.
 * - `'product-slider'`, `'product_slider'` and `'ProductSlider'` all resolve to
 *   the same store.
 * - Calling it also creates `window.StorePress` and `window.StorePress.$Plugins`
 *   if they are missing. It needs `window`, so it throws a ReferenceError during
 *   server-side rendering or in Node without a DOM.
 *
 * @param {string} namespace - Plugin namespace, e.g. `'product-slider'`.
 *
 * @return {WeakMap<Element, Object>} The shared instance store for the namespace.
 *
 * @throws {ReferenceError} When `window` is not defined.
 *
 * @example
 * // At a glance
 * const store = getPluginInstanceStore( 'product-slider' );
 * store instanceof WeakMap;                                  // true
 * store === getPluginInstanceStore( 'product-slider' );      // true
 * store === window.StorePress.$Plugins.ProductSlider.Instance; // true
 * store.has( document.querySelector( '#hero-slider' ) );     // true once initialized
 *
 * @example
 * // Real-life use case: check initialization without creating anything
 * // Show a placeholder until the slider script has run.
 * const $slider = document.querySelector( '#hero-slider' );
 * $slider.classList.toggle( 'is-loading', ! getPluginInstanceStore( 'product-slider' ).has( $slider ) );
 *
 * @example
 * // Real-life use case: wrap an existing instance created by another bundle
 * const store = getPluginInstanceStore( 'product-slider' );
 * const $slider = document.querySelector( '#hero-slider' );
 * const slider = store.get( $slider );
 *
 * if ( slider ) {
 *   const goTo = slider.goTo.bind( slider );
 *   slider.goTo = ( index ) => {
 *     window.dataLayer?.push( { event: 'slider_change', index } );
 *     goTo( index );
 *   };
 * }
 *
 * @example
 * // Real-life use case: isolate tests
 * beforeEach( () => {
 *   delete window.StorePress; // Fresh stores for every test.
 * } );
 *
 * it( 'stores the instance', () => {
 *   document.body.innerHTML = '<div id="s"></div>';
 *   createPluginInstance( '#s', {}, ProductSlider, 'product-slider' );
 *   expect( getPluginInstanceStore( 'product-slider' ).has( document.getElementById( 's' ) ) ).toBe( true );
 * } );
 *
 * @see createPluginInstance Writes instances to this store.
 * @see getPluginInstance    Reads instances from this store.
 * @see getStorePressPlugin  The controller stored under the same namespace.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap WeakMap
 *
 * @since 0.7.0
 */
export function getPluginInstanceStore(namespace) {
  const name = toUpperCamelCase(namespace);

  // Ensure nested structure exists
  window.StorePress = window.StorePress || {};
  window.StorePress.$Plugins = window.StorePress.$Plugins || {};
  window.StorePress.$Plugins[name] = window.StorePress.$Plugins[name] || {};

  // Create WeakMap if it doesn't exist
  if (!window.StorePress.$Plugins[name].Instance) {
    window.StorePress.$Plugins[name].Instance = new WeakMap();
  }
  return window.StorePress.$Plugins[name].Instance;
}