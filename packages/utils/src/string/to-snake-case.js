'use strict';
/**
 * Converts a camelCase, kebab-case, dotted or spaced string to snake_case.
 *
 * The input is split into words at separators (`-`, `_`, `.`, `:`, `~` or
 * whitespace) and at case changes (`variationId`, `XMLHttpRequest`). The words are
 * lowercased and joined with underscores. Use it for keys sent to PHP (`admin-ajax.php` actions, option names),
 * WooCommerce attribute taxonomy slugs, and storage keys.
 *
 * Notes:
 * - Repeated, leading and trailing separators and whitespace are ignored:
 *   `'foo--bar'`, `'foo - bar'` and `'  foo bar  '` all become `'foo_bar'`.
 * - An acronym is one word: `'XMLHttpRequest'` becomes `'xml_http_request'`.
 * - Digits stay attached to the word before them: `'item2Count'` becomes `'item2_count'`.
 * - Other characters such as `+` or `/` are kept as-is.
 * - The input must be a string; `null` and numbers throw a `TypeError`.
 *
 * @param {string} string - Text to convert.
 * @return {string} The snake_case string.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * toSnakeCase( 'variationId' );           // 'variation_id'
 * toSnakeCase( 'ProductGallery' );        // 'product_gallery'
 * toSnakeCase( 'product-gallery' );       // 'product_gallery'
 * toSnakeCase( 'data:slider:speed' );     // 'data_slider_speed'
 * toSnakeCase( 'Screen Size' );           // 'screen_size'
 * toSnakeCase( 'HELLO_WORLD' );           // 'hello_world'
 * toSnakeCase( 'XMLHttpRequest' );        // 'xml_http_request'
 * toSnakeCase( 'foo--bar' );              // 'foo_bar'
 * toSnakeCase( '' );                      // ''
 *
 * @example
 * // Real-life use case: sending an add-to-cart request to admin-ajax.php
 * // PHP reads `$_POST['product_id']`, `$_POST['variation_id']`, and so on.
 * const item = { productId: 42, variationId: 57, quantity: 2 };
 * const body = new FormData();
 *
 * body.append( 'action', 'storepress_add_to_cart' );
 * Object.entries( item ).forEach( ( [ key, value ] ) => {
 *   body.append( toSnakeCase( key ), value ); // product_id, variation_id, quantity
 * } );
 *
 * fetch( settings.ajaxUrl, { method: 'POST', body } );
 *
 * @example
 * // Real-life use case: matching a WooCommerce attribute taxonomy
 * // Global attributes are stored as `pa_<slug>`.
 * const taxonomy = `pa_${ toSnakeCase( 'Screen Size' ) }`; // 'pa_screen_size'
 * const $select = document.querySelector( `select[name="attribute_${ taxonomy }"]` );
 *
 * @example
 * // Real-life use case: namespaced localStorage keys
 * // Keeps keys consistent no matter how the plugin namespace is written.
 * function storageKey( namespace, key ) {
 *   return `storepress_${ toSnakeCase( namespace ) }_${ toSnakeCase( key ) }`;
 * }
 *
 * storageKey( 'recently-viewed', 'productIds' ); // 'storepress_recently_viewed_product_ids'
 *
 * @see toKebabCase
 * @see toConstantCase
 *
 * @since 0.8.0
 */
export function toSnakeCase( string ) {
	return (
		string
			// Split an acronym from the next word: "XMLHttp" → "XML Http".
			.replace( /([A-Z]+)([A-Z][a-z])/g, '$1 $2' )
			// Split camelCase boundaries: "addToCart" → "add To Cart".
			.replace( /([a-z0-9])([A-Z])/g, '$1 $2' )
			// Split on separators; drop empty parts from repeated, leading or trailing ones.
			.split( /[-._:~\s]+/ )
			.filter( Boolean )
			// Lowercase each word and join with underscores.
			.map( ( word ) => word.toLowerCase() )
			.join( '_' )
	);
}
