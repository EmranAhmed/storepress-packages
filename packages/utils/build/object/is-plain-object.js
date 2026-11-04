'use strict';

/**
 * Checks whether a value is a plain object (a simple key/value map).
 *
 * A plain object is one created by an object literal (`{}`), `JSON.parse`,
 * `new Object()` or `Object.create( null )`. Its prototype is either
 * `Object.prototype` or `null`. Everything else that `typeof` calls an
 * "object" (arrays, `null`, dates, regular expressions, maps, sets, DOM
 * elements, class instances) is rejected.
 *
 * Use it before treating a value as a settings map: deciding whether to merge
 * two values recursively (as `deepMerge` does) or replace one with the other,
 * or validating options parsed from JSON, a `data-*` attribute or an API
 * response before reading their keys.
 *
 * | Value                                              | Result  |
 * | -------------------------------------------------- | ------- |
 * | `{}`, `{ a: 1 }`, `new Object()`                   | `true`  |
 * | `JSON.parse( '{"a":1}' )`                          | `true`  |
 * | `Object.create( null )`                            | `true`  |
 * | `[]`, `null`, `undefined`, strings, numbers        | `false` |
 * | `new Date()`, `/re/`, `new Map()`, `new Set()`     | `false` |
 * | Functions, DOM elements, class instances           | `false` |
 * | `Object.create( { a: 1 } )` (custom prototype)     | `false` |
 * | `{}` created in another frame (iframe)             | `false` |
 *
 * Notes:
 * - Objects from another realm (an iframe or a Node `vm` context) return
 *   `false`, because their prototype is that realm's `Object.prototype`.
 * - Only the prototype is checked. A plain object can still hold any values,
 *   including functions, elements and other non-plain objects.
 * - The check is O(1) and never reads the object's keys.
 *
 * @param {*} value - Value to check.
 *
 * @return {boolean} `true` when the value is a plain object, otherwise `false`.
 *
 * @example
 * // At a glance
 * isPlainObject( { a: 1 } );                     // true
 * isPlainObject( JSON.parse( '{"a":1}' ) );      // true
 * isPlainObject( Object.create( null ) );        // true
 * isPlainObject( [ 1, 2 ] );                     // false
 * isPlainObject( null );                         // false
 * isPlainObject( new Date() );                   // false
 * isPlainObject( document.body );                // false
 * isPlainObject( new ( class Slider {} )() );    // false
 * isPlainObject( Object.create( { a: 1 } ) );    // false
 *
 * @example
 * // Real-life use case: validating options from a data attribute
 * // <div class="product-gallery" data-gallery='{"thumbnails":"bottom"}'>
 * function readGalleryOptions( $gallery ) {
 *   try {
 *     const parsed = JSON.parse( $gallery.dataset.gallery || '{}' );
 *     // '[1,2]' and '"bottom"' are valid JSON but not option maps.
 *     return isPlainObject( parsed ) ? parsed : {};
 *   } catch {
 *     return {};
 *   }
 * }
 *
 * @example
 * // Real-life use case: an option that accepts a shortcut or a full object
 * // `autoplay: true` and `autoplay: { delay: 3000 }` are both allowed.
 * function normalizeAutoplay( autoplay ) {
 *   if ( isPlainObject( autoplay ) ) {
 *     return { enabled: true, delay: 5000, ...autoplay };
 *   }
 *   return { enabled: Boolean( autoplay ), delay: 5000 };
 * }
 *
 * normalizeAutoplay( true );               // { enabled: true, delay: 5000 }
 * normalizeAutoplay( { delay: 3000 } );    // { enabled: true, delay: 3000 }
 * normalizeAutoplay( false );              // { enabled: false, delay: 5000 }
 *
 * @example
 * // Real-life use case: checking a WooCommerce AJAX response before using it
 * // `wc-ajax=get_refreshed_fragments` returns { fragments: { selector: html } }.
 * async function refreshCartFragments() {
 *   const response = await fetch( '/?wc-ajax=get_refreshed_fragments', { method: 'POST' } );
 *   const { fragments } = await response.json();
 *
 *   if ( ! isPlainObject( fragments ) ) {
 *     return;
 *   }
 *
 *   Object.entries( fragments ).forEach( ( [ selector, html ] ) => {
 *     document.querySelector( selector )?.replaceWith(
 *       document.createRange().createContextualFragment( html )
 *     );
 *   } );
 * }
 *
 * @example
 * // Real-life use case: a recursive helper that only walks into plain objects
 * // Count the settings in nested plugin options without walking into elements.
 * function countSettings( options ) {
 *   return Object.values( options ).reduce(
 *     ( total, value ) => total + ( isPlainObject( value ) ? countSettings( value ) : 1 ),
 *     0
 *   );
 * }
 *
 * countSettings( { speed: 300, nav: { arrows: true, dots: false }, $root: document.body } ); // 4
 *
 * @see deepMerge
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf Object.getPrototypeOf()
 *
 * @since 0.14.0
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPlainObject = isPlainObject;
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}