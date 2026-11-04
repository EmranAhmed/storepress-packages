'use strict';
/**
 * Converts a separated or capitalized string to camelCase.
 *
 * The input is split into words at separators (`-`, `_`, `.`, `:`, `~` or
 * whitespace) and at case changes (`addToCart`, `XMLHttpRequest`). The first word
 * is lowercased, each later word is capitalized, and the words are joined. Use it to turn kebab-case attribute names, snake_case keys from PHP
 * (`wp_localize_script`, REST responses), or dotted paths into JavaScript
 * property names.
 *
 * Notes:
 * - Every word is lowercased before it is capitalized, so all-caps input works:
 *   `'HELLO_WORLD'` becomes `'helloWorld'`.
 * - Acronyms become one word: `'XMLHttpRequest'` becomes `'xmlHttpRequest'`.
 * - Repeated, leading and trailing separators and whitespace are ignored:
 *   `'foo--bar'` and `'  foo bar  '` both become `'fooBar'`.
 * - Digits stay attached to their word, and a separator before a number is removed:
 *   `'item2Count'` stays `'item2Count'`, and `'sku-123'` becomes `'sku123'`.
 * - Other characters such as `+` or `/` are kept as-is.
 * - The input must be a string; `null` and numbers throw a `TypeError`.
 *
 * @param {string} string - Text to convert.
 * @return {string} The camelCase string.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * toCamelCase( 'product-gallery' );    // 'productGallery'
 * toCamelCase( 'variation_swatches' ); // 'variationSwatches'
 * toCamelCase( 'data:slider:speed' );  // 'dataSliderSpeed'
 * toCamelCase( 'free shipping bar' );  // 'freeShippingBar'
 * toCamelCase( 'HelloWorld' );         // 'helloWorld'
 * toCamelCase( 'addToCart' );          // 'addToCart'
 * toCamelCase( 'HELLO_WORLD' );        // 'helloWorld'
 * toCamelCase( 'XMLHttpRequest' );     // 'xmlHttpRequest'
 * toCamelCase( 'sku-123' );            // 'sku123'
 * toCamelCase( '  --foo--bar--  ' );   // 'fooBar'
 * toCamelCase( '' );                   // ''
 *
 * @example
 * // Real-life use case: normalizing settings passed from PHP
 * // `wp_localize_script` data usually uses snake_case keys.
 * const settings = {
 *   ajax_url: '/wp-admin/admin-ajax.php',
 *   cart_hash: 'a1b2c3',
 *   free_shipping_min: 50,
 * };
 *
 * const config = Object.fromEntries(
 *   Object.entries( settings ).map( ( [ key, value ] ) => [ toCamelCase( key ), value ] )
 * );
 * // { ajaxUrl: '/wp-admin/admin-ajax.php', cartHash: 'a1b2c3', freeShippingMin: 50 }
 *
 * @example
 * // Real-life use case: applying CSS from a kebab-case swatch config
 * // Swatch colors come from attribute term meta as CSS property names.
 * const swatchStyles = { 'background-color': '#c0392b', 'border-radius': '50%' };
 * const $swatch = document.querySelector( '.variation-swatch[data-value="red"]' );
 *
 * Object.entries( swatchStyles ).forEach( ( [ property, value ] ) => {
 *   $swatch.style[ toCamelCase( property ) ] = value; // backgroundColor, borderRadius
 * } );
 *
 * @example
 * // Real-life use case: reading nested options from data attribute names
 * // `data-gallery--zoom-level="2"` should become `{ zoomLevel: 2 }` under `gallery`.
 * const [ group, option ] = 'gallery--zoom-level'.split( '--' ).map( toCamelCase );
 * // group: 'gallery', option: 'zoomLevel'
 *
 * @see toUpperCamelCase
 * @see toKebabCase
 *
 * @since 0.3.0
 */
export function toCamelCase( string ) {
	return (
		string
			// Split an acronym from the next word: "XMLHttp" → "XML Http".
			.replace( /([A-Z]+)([A-Z][a-z])/g, '$1 $2' )
			// Split camelCase boundaries: "addToCart" → "add To Cart".
			.replace( /([a-z0-9])([A-Z])/g, '$1 $2' )
			// Split on separators; drop empty parts from repeated, leading or trailing ones.
			.split( /[-._:~\s]+/ )
			.filter( Boolean )
			.map( ( word, index ) => {
				const lower = word.toLowerCase();
				return index === 0
					? lower
					: lower.charAt( 0 ).toUpperCase() + lower.slice( 1 );
			} )
			.join( '' )
	);
}
