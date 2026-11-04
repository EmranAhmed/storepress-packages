'use strict';

/**
 * Internal dependencies
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPluginInstance = getPluginInstance;
var _getElements = require("../dom/get-elements.js");
var _getPluginInstanceStore = require("../store/get-plugin-instance-store.js");
/**
 * Returns the existing plugin instances for the given elements. It never creates one.
 *
 * Resolves `selectors` with `getElements()`, keeps only the elements that have an
 * instance in `window.StorePress.$Plugins[ Namespace ].Instance`, and returns
 * those instances. Use it to call public methods on a running plugin from
 * another script, check whether an element is already initialized, or inspect
 * a plugin in the browser console.
 *
 * Notes:
 * - The result only contains elements that have an instance, so its length can
 *   be smaller than the number of matched elements, and indexes do not line up
 *   with the selector result.
 * - It always returns an array. Use `[ 0 ]` with optional chaining for one element:
 *   `getPluginInstance( '#hero-slider', 'product-slider' )[ 0 ]?.next()`.
 * - Reading the store creates an empty namespace entry on `window.StorePress`
 *   if it does not exist yet. This is harmless.
 * - The store is a WeakMap, so there is no way to list every instance of a
 *   namespace without a selector. Pass a selector that matches all its elements.
 *
 * @param {string|Element|Document|Array<Element>|NodeList} selectors - Targets, as accepted by `getElements()`.
 * @param {string}                                          namespace - Plugin namespace, e.g. `'product-slider'`. Converted with `toUpperCamelCase()`.
 *
 * @return {Array<Object>} Instances for the matched elements that have one. Empty when none do.
 *
 * @example
 * // At a glance
 * getPluginInstance( '.product-slider', 'product-slider' ); // [ ProductSlider, ProductSlider ]
 * getPluginInstance( '#hero-slider', 'product-slider' );    // [ ProductSlider ]
 * getPluginInstance( '#not-initialized', 'product-slider' ); // []
 * getPluginInstance( '#hero-slider', 'other-plugin' );       // [] (different namespace)
 *
 * @example
 * // Real-life use case: control another plugin from a theme script
 * // Go to the slide of the clicked gallery thumbnail.
 * document.querySelectorAll( '.gallery-thumbnail' ).forEach( ( thumbnail ) => {
 *   thumbnail.addEventListener( 'click', () => {
 *     const [ slider ] = getPluginInstance( '#hero-slider', 'product-slider' );
 *     slider?.goTo( Number( thumbnail.dataset.index ) );
 *   } );
 * } );
 *
 * @example
 * // Real-life use case: avoid double initialization
 * const $grid = document.querySelector( '.products' );
 * if ( getPluginInstance( $grid, 'infinite-scroll' ).length === 0 ) {
 *   createPluginInstance( $grid, { threshold: 300 }, InfiniteScroll, 'infinite-scroll' );
 * }
 *
 * @example
 * // Real-life use case: pause every slider while a modal is open
 * jQuery( document.body ).on( 'quick-view-opened', () => {
 *   getPluginInstance( '.product-slider', 'product-slider' ).forEach( ( slider ) => slider.pause() );
 * } );
 *
 * @example
 * // Real-life use case: inspect the instance of the element under the cursor
 * // Log the instance on Alt + click while testing a product page.
 * document.addEventListener( 'click', ( event ) => {
 *   if ( ! event.altKey ) {
 *     return;
 *   }
 *   const $slider = event.target.closest( '.product-slider' );
 *   console.log( getPluginInstance( $slider, 'product-slider' )[ 0 ] ?? 'Not initialized' );
 * } );
 *
 * @see createPluginInstance   Creates the instances this function reads.
 * @see createPlugin           Its `get()` method calls this with the plugin namespace.
 * @see getPluginInstanceStore The WeakMap behind this function.
 */
function getPluginInstance(selectors, namespace) {
  const store = (0, _getPluginInstanceStore.getPluginInstanceStore)(namespace);
  return Array.from((0, _getElements.getElements)(selectors)).filter(element => store.has(element)).map(element => store.get(element));
}