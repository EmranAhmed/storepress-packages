'use strict';
/**
 * Converts a camelCase, snake_case, dotted or spaced string to kebab-case.
 *
 * The input is split into words at separators (`-`, `_`, `.`, `:`, `~` or
 * whitespace) and at case changes (`addToCart`, `XMLHttpRequest`). The words are
 * lowercased and joined with hyphens. Use it for HTML attribute names, CSS class names, CSS custom properties and
 * event names, which are conventionally kebab-case.
 *
 * Notes:
 * - Repeated, leading and trailing separators and whitespace are ignored:
 *   `'foo__bar'`, `'foo - bar'` and `'  foo bar  '` all become `'foo-bar'`.
 * - An acronym is one word: `'XMLHttpRequest'` becomes `'xml-http-request'`.
 * - Digits stay attached to the word before them: `'item2Count'` becomes `'item2-count'`.
 * - Other characters such as `+` or `/` are kept as-is.
 * - The input must be a string; `null` and numbers throw a `TypeError`.
 *
 * @param {string} string - Text to convert.
 * @return {string} The kebab-case string.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * toKebabCase( 'autoplaySpeed' );         // 'autoplay-speed'
 * toKebabCase( 'ProductGallery' );        // 'product-gallery'
 * toKebabCase( 'variation_swatches' );    // 'variation-swatches'
 * toKebabCase( 'product.gallery.thumb' ); // 'product-gallery-thumb'
 * toKebabCase( 'HELLO_WORLD' );           // 'hello-world'
 * toKebabCase( '  padded value  ' );      // 'padded-value'
 * toKebabCase( 'XMLHttpRequest' );        // 'xml-http-request'
 * toKebabCase( 'item2Count' );            // 'item2-count'
 * toKebabCase( 'foo__bar' );              // 'foo-bar'
 * toKebabCase( '' );                      // ''
 *
 * @example
 * // Real-life use case: exposing gallery settings as CSS custom properties
 * // Produces --sp-thumb-size, --sp-gap-size and --sp-columns on the gallery.
 * const settings = { thumbSize: '80px', gapSize: '12px', columns: 4 };
 * const $gallery = document.querySelector( '.product-gallery' );
 *
 * Object.entries( settings ).forEach( ( [ key, value ] ) => {
 *   $gallery.style.setProperty( `--sp-${ toKebabCase( key ) }`, String( value ) );
 * } );
 *
 * @example
 * // Real-life use case: writing options back to data attributes
 * // `{ autoplaySpeed: 3000 }` becomes data-autoplay-speed="3000".
 * function setDataOptions( $element, options ) {
 *   Object.entries( options ).forEach( ( [ key, value ] ) => {
 *     $element.setAttribute( `data-${ toKebabCase( key ) }`, value );
 *   } );
 * }
 *
 * setDataOptions( $slider, { autoplaySpeed: 3000, showArrows: true } );
 *
 * @example
 * // Real-life use case: building badge class names from product labels
 * // A "Free Shipping" label gets the class `badge--free-shipping`.
 * function createBadge( label ) {
 *   const $badge = document.createElement( 'span' );
 *   $badge.className = `badge badge--${ toKebabCase( label ) }`;
 *   $badge.textContent = label;
 *   return $badge;
 * }
 *
 * createBadge( 'Free Shipping' ); // <span class="badge badge--free-shipping">
 *
 * @see toSnakeCase
 * @see toCamelCase
 *
 * @since 0.8.0
 */
export function toKebabCase( string ) {
	return (
		string
			// Split an acronym from the next word: "XMLHttp" → "XML Http".
			.replace( /([A-Z]+)([A-Z][a-z])/g, '$1 $2' )
			// Split camelCase boundaries: "addToCart" → "add To Cart".
			.replace( /([a-z0-9])([A-Z])/g, '$1 $2' )
			// Split on separators; drop empty parts from repeated, leading or trailing ones.
			.split( /[-._:~\s]+/ )
			.filter( Boolean )
			// Lowercase each word and join with hyphens.
			.map( ( word ) => word.toLowerCase() )
			.join( '-' )
	);
}
