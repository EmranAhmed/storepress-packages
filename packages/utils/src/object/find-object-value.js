'use strict';
/**
 * Internal dependencies
 */
import { escapeRegex } from '../string/escape-regex.js';

const DEFAULT_NOTATION = [ '.', '-', '_' ];

/**
 * Builds a regex that matches each key in a string path: runs of characters
 * that are neither a separator nor a bracket.
 *
 * @param {string[]} separators - Single-character separators.
 *
 * @return {RegExp} Global regex matching each key.
 */
function createKeyPattern( separators ) {
	const separatorPattern = separators
		.map( ( separator ) => escapeRegex( separator ) )
		.join( '' );

	return new RegExp( `[^[${ separatorPattern }\\]]+`, 'g' );
}

// Built once and reused, since the default notation covers most calls.
const DEFAULT_KEY_PATTERN = createKeyPattern( DEFAULT_NOTATION );

/**
 * Turns a path argument into an array of keys.
 *
 * @param {string|number|Array}  path     - Path string, number index, or array of keys.
 * @param {string|string[]|null} notation - Separator character(s).
 *
 * @return {Array} The keys, or an empty array when the path has none.
 */
function toKeys( path, notation ) {
	if ( Array.isArray( path ) ) {
		return path;
	}

	if ( typeof path === 'number' ) {
		return Number.isNaN( path ) ? [] : [ path ];
	}

	if ( typeof path !== 'string' || path === '' ) {
		return [];
	}

	let pattern = DEFAULT_KEY_PATTERN;

	if ( notation !== undefined && notation !== null ) {
		pattern = createKeyPattern(
			Array.isArray( notation ) ? notation : [ notation ]
		);
	}

	return path.match( pattern ) || [];
}

/**
 * Reads a nested value from an object using a path string or an array of keys.
 *
 * Instead of writing `settings && settings.nav && settings.nav.arrows` or
 * repeating `?.` chains, pass the path as one string, such as `'nav.arrows'`.
 * By default `.`, `-` and `_` all separate keys, so `'nav.arrows'`,
 * `'nav-arrows'` and `'nav_arrows'` read the same value. That makes it easy
 * to map attribute-style names (`data-slider-nav-arrows`) onto nested options.
 * Bracket indexes work too: `'items[0].name'`.
 *
 * Pass an array of keys (`[ 'nav', 'arrows' ]`) when a key itself contains a
 * separator, or when the keys come from code. The array is used as-is and is
 * never split.
 *
 * | Path                          | Keys looked up                  |
 * | ----------------------------- | ------------------------------- |
 * | `'user.address.city'`         | `user` → `address` → `city`     |
 * | `'user-address-city'`         | `user` → `address` → `city`     |
 * | `'user_address_city'`         | `user` → `address` → `city`     |
 * | `'items[0].name'`             | `items` → `0` → `name`          |
 * | `'user/name'` with `'/'`      | `user` → `name`                 |
 * | `[ 'user', 'first_name' ]`    | `user` → `first_name`           |
 *
 * Notes:
 * - Keys that contain a separator cannot be reached with a string path using
 *   the default notation: `'user.first_name'` looks up `user.first.name`. Use an
 *   array path, or pass `notation` with only the separators you need (`'.'`).
 * - The default value is used only when the result is `undefined`. A `null`
 *   value is returned as `null`.
 * - A path with no keys returns `undefined`, not `defaultValue`. That covers an
 *   empty string, `[]`, `null`, `false`, and a string made only of separators
 *   or brackets (`'...'`, `'[]'`).
 * - A number is treated as a single key: `findObjectValue( list, 1 )` reads
 *   `list[ 1 ]`.
 * - Only own properties are followed. `'constructor'` or `'toString'` on a
 *   plain object returns `defaultValue`, not the inherited method. Strings and
 *   arrays still expose `length` and indexes (`'name.length'` works).
 * - Empty segments are skipped: `'a..b'`, `'.a.b.'` and `'a[b'` all read `a.b`.
 * - Bracket keys are not quoted: `"a['b']"` looks up the key `'b'` including
 *   the quotes. Use `'a.b'`, `'a[b]'` or an array path.
 * - Lookup stops at the first falsy value on the way and returns it. For
 *   example, with `{ count: 0 }` the path `'count.total'` returns `0`, and with
 *   `{ sale: null }` the path `'sale.price'` returns `null`, not the default.
 *   A `null` or `undefined` `obj` behaves the same way (`null` is returned for
 *   a `null` object).
 * - Passing a custom `notation` replaces the defaults; it does not add to them.
 *   `null` or `undefined` uses the defaults. Each separator is one character;
 *   a longer string such as `'::'` is read as the set of its characters.
 *   An empty array (`[]`) means no separators, so the whole string is one key.
 * - The object is only read, never modified.
 *
 * @param {Object}              obj                          - Object to read from.
 * @param {string|number|Array} path                         - Path string (`'a.b.c'`, `'a-b'`, `'a[0].b'`), a number index, or an array of keys.
 * @param {*}                   [defaultValue]               - Returned when the value is `undefined`.
 * @param {string|string[]}     [notation=[ '.', '-', '_' ]] - Separator character(s) used to split a string path.
 *
 * @return {*} The value at the path, `defaultValue` when it is `undefined` or missing, or `undefined` when `path` has no keys.
 *
 * @example
 * // At a glance
 * const product = {
 *   name: 'Hoodie',
 *   price: { regular: 40, sale: null },
 *   stock: 0,
 *   variations: [ { sku: 'HD-S' }, { sku: 'HD-M' } ],
 *   meta: { color_code: '#333' },
 * };
 *
 * findObjectValue( product, 'price.regular' );               // 40
 * findObjectValue( product, 'price-regular' );               // 40
 * findObjectValue( product, 'variations[1].sku' );           // 'HD-M'
 * findObjectValue( product, 'variations.0.sku' );            // 'HD-S'
 * findObjectValue( product, 'price.sale', 'n/a' );           // null (only undefined uses the default)
 * findObjectValue( product, 'weight', 'n/a' );               // 'n/a'
 * findObjectValue( product, 'stock.count', 10 );             // 0 (stops at the falsy value)
 * findObjectValue( product, 'meta.color_code', 'none' );     // 'none' (looks up meta.color.code)
 * findObjectValue( product, [ 'meta', 'color_code' ] );      // '#333'
 * findObjectValue( product, 'meta.color_code', '', '.' );    // '#333'
 * findObjectValue( product, '', 'n/a' );                     // undefined (empty path)
 * findObjectValue( product, '...', 'n/a' );                  // undefined (no keys)
 * findObjectValue( product.variations, 1 );                  // { sku: 'HD-M' }
 * findObjectValue( product, 'constructor', 'n/a' );          // 'n/a' (inherited, not own)
 *
 * @example
 * // Real-life use case: reading localized script data with a fallback
 * // wp_localize_script() output: window.storepressCart = { i18n: { added: '...' } }
 * function cartText( key, fallback ) {
 *   return findObjectValue( window.storepressCart, `i18n.${ key }`, fallback );
 * }
 *
 * cartText( 'added', 'Added to cart' );     // translated text, or 'Added to cart'
 * cartText( 'viewCart', 'View cart' );
 *
 * @example
 * // Real-life use case: mapping attribute-style names to nested options
 * // <div data-option="nav-arrows"> toggles options.nav.arrows.
 * const options = { nav: { arrows: true, dots: false }, autoplay: { delay: 3000 } };
 *
 * document.querySelectorAll( '[data-option]' ).forEach( ( $toggle ) => {
 *   const enabled = findObjectValue( options, $toggle.dataset.option, false );
 *   $toggle.classList.toggle( 'is-enabled', Boolean( enabled ) );
 * } );
 *
 * @example
 * // Real-life use case: sorting products by a configurable field
 * // The sort field comes from a <select> such as "price.regular" or "rating.average".
 * function sortProducts( products, field, direction = 'asc' ) {
 *   const sign = direction === 'asc' ? 1 : -1;
 *   return [ ...products ].sort(
 *     ( a, b ) => ( findObjectValue( a, field, 0 ) - findObjectValue( b, field, 0 ) ) * sign
 *   );
 * }
 *
 * sortProducts( products, document.querySelector( '#orderby' ).value );
 *
 * @example
 * // Real-life use case: reading a WooCommerce Store API response
 * // Keys like "currency_minor_unit" contain "_", so use "." as the only separator.
 * const cart = await ( await fetch( '/wp-json/wc/store/v1/cart' ) ).json();
 *
 * const minorUnit = findObjectValue( cart, 'totals.currency_minor_unit', 2, '.' );
 * const total = findObjectValue( cart, 'totals.total_price', '0', '.' );
 * const formatted = ( Number( total ) / 10 ** minorUnit ).toFixed( minorUnit );
 *
 * @see escapeRegex
 */
export function findObjectValue(
	obj,
	path,
	defaultValue,
	notation = DEFAULT_NOTATION
) {
	const keys = toKeys( path, notation );

	// No keys to look up: '', null, false, [] or a path made only of separators like '...'.
	if ( keys.length === 0 ) {
		return undefined;
	}

	let current = obj;

	for ( const key of keys ) {
		// Stop at the first falsy value on the way and return it.
		if ( ! current ) {
			return current === undefined ? defaultValue : current;
		}

		// Only follow own properties, so 'constructor' or 'toString' are not
		// read from the prototype. Object() lets strings expose 'length' and indexes.
		if (
			! Object.prototype.hasOwnProperty.call( Object( current ), key )
		) {
			return defaultValue;
		}

		current = current[ key ];
	}

	return current === undefined ? defaultValue : current;
}
