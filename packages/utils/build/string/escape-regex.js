'use strict';

// Characters escaped with a backslash: regex syntax characters and "/".
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeRegex = escapeRegex;
const SYNTAX_CHARACTER = /^[\^$\\.*+?()[\]{}|/]$/;

// Characters that have a short control escape.
const CONTROL_ESCAPES = {
  '\t': '\\t',
  '\n': '\\n',
  '\v': '\\v',
  '\f': '\\f',
  '\r': '\\r'
};

// Characters escaped as hex: punctuators that are syntax in some contexts
// (`v`-flag classes, named groups, lookbehind), plus whitespace and line terminators.
const HEX_ESCAPED = /^[,\-=<>#&!%:;@~'`"\s]$/;

/**
 * Returns the hex escape for one character: `\xHH` up to U+00FF, otherwise one
 * `\uHHHH` per UTF-16 code unit.
 *
 * Use case: escaping a character that has no backslash form, the same way
 * `RegExp.escape()` does.
 *
 * @private
 *
 * @param {string} char - A single code point (one or two UTF-16 code units).
 * @return {string} The hex escape sequence.
 *
 * @example
 * toHexEscape( '-' ); // '\\x2d'
 *
 * @example
 * toHexEscape( '\u2028' ); // '\\u2028'
 */
function toHexEscape(char) {
  const code = char.charCodeAt(0);
  if (char.length === 1 && code <= 0xff) {
    return `\\x${code.toString(16).padStart(2, '0')}`;
  }
  return Array.from({
    length: char.length
  }, (_, index) => `\\u${char.charCodeAt(index).toString(16).padStart(4, '0')}`).join('');
}

/**
 * Escapes a string by the `RegExp.escape()` specification, for browsers that
 * don't provide the native method.
 *
 * Use case: called by `escapeRegex` when `RegExp.escape` is missing, so the
 * output is the same in every browser.
 *
 * @private
 *
 * @param {string} string - Text to escape.
 * @return {string} The escaped text, identical to `RegExp.escape( string )`.
 *
 * @example
 * escapeRegexFallback( 'price (USD)' ); // '\\x70rice\\x20\\(USD\\)'
 *
 * @example
 * escapeRegexFallback( '1.5' ); // '\\x31\\.5'
 */
function escapeRegexFallback(string) {
  let result = '';
  let isFirst = true;

  // `for...of` walks code points, so emoji stay together and lone surrogates stay alone.
  for (const char of string) {
    const code = char.charCodeAt(0);
    const isLoneSurrogate = char.length === 1 && code >= 0xd800 && code <= 0xdfff;
    if (isFirst && /^[0-9A-Za-z]$/.test(char)) {
      result += toHexEscape(char);
    } else if (SYNTAX_CHARACTER.test(char)) {
      result += `\\${char}`;
    } else if (CONTROL_ESCAPES[char]) {
      result += CONTROL_ESCAPES[char];
    } else if (HEX_ESCAPED.test(char) || isLoneSurrogate) {
      result += toHexEscape(char);
    } else {
      result += char;
    }
    isFirst = false;
  }
  return result;
}

/**
 * Escapes regular expression special characters so a string matches itself literally.
 *
 * When a pattern is built from data you don't control, such as a search term, a
 * price with a currency symbol, a decimal separator from store settings, or a
 * placeholder token like `{price}`, characters like `.`, `$`, `(` or `?` would be
 * treated as regex syntax. `escapeRegex` escapes them so they match literally, and
 * the result can be safely placed inside `new RegExp()`.
 *
 * It uses the native `RegExp.escape()` when the browser provides it. Otherwise a
 * fallback that follows the same specification is used, so the output is
 * identical in every browser.
 *
 * What gets escaped (same rules as `RegExp.escape()`):
 *
 * | Characters                                                  | Escaped as                  |
 * | ----------------------------------------------------------- | --------------------------- |
 * | Syntax characters `^ $ \ . * + ? ( ) [ ] { } \|` and `/`  | Backslash: `\.`, `\(`     |
 * | A leading letter or digit                                   | Hex: `'a.b'` → `\x61\.b`  |
 * | Punctuators `, - = < > # & ! % : ; @ ~ ' \` "`             | Hex: `-` → `\x2d`          |
 * | Whitespace and line terminators                             | Hex or control: `\x20`, `\n` |
 * | Everything else                                             | Unchanged                   |
 *
 * Notes:
 * - The result is valid with every flag, including `u` and `v`, and inside
 *   character classes (`[...]`).
 * - Hex-escaping the first letter or digit keeps it from merging with what comes
 *   before it in a larger pattern, such as a backreference (`\1` + `'0'`) or a
 *   `\x` prefix.
 * - Because letters, digits and punctuation are escaped, the output is longer than
 *   the input. Compare matching results rather than escaped strings in tests.
 * - The input must be a string. Numbers, `null` and `undefined` throw a `TypeError`.
 * - For a plain one-off replace, `String.prototype.replaceAll( text, value )` needs no
 *   escaping. Use `escapeRegex` when the text is part of a larger pattern, such as
 *   an alternation, anchors or flags.
 *
 * @param {string} string - Text to match literally.
 * @return {string} The text with regex special characters escaped.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * escapeRegex( '$19.99' );                                 // '\\$19\\.99'
 * escapeRegex( 'a.b' );                                    // '\\x61\\.b'
 * escapeRegex( 'wc-cart' );                                // '\\x77c\\x2dcart'
 * escapeRegex( '' );                                       // ''
 * new RegExp( escapeRegex( '$19.99' ) ).test( 'Total: $19.99' ); // true
 * new RegExp( escapeRegex( 'a.b' ) ).test( 'axb' );        // false
 * new RegExp( escapeRegex( 'wc-cart' ), 'u' ).test( 'wc-cart' ); // true
 * escapeRegex( 42 );                                       // throws TypeError
 *
 * @example
 * // Real-life use case: filtering a product list as the shopper types
 * // A query like "c++ (2nd ed.)" must not break the pattern.
 * const $search = document.querySelector( '.product-search' );
 *
 * $search.addEventListener( 'input', () => {
 *   const pattern = new RegExp( escapeRegex( $search.value.trim() ), 'i' );
 *
 *   document.querySelectorAll( '.product' ).forEach( ( $product ) => {
 *     $product.hidden = ! pattern.test( $product.dataset.name );
 *   } );
 * } );
 *
 * @example
 * // Real-life use case: parsing a formatted price using WooCommerce store settings
 * // With a thousand separator of "." and a decimal separator of ",".
 * function parsePrice( text, { thousandSeparator, decimalSeparator } ) {
 *   const number = text
 *     .replace( new RegExp( escapeRegex( thousandSeparator ), 'g' ), '' )
 *     .replace( decimalSeparator, '.' )
 *     .replace( /[^\d.-]/g, '' );
 *
 *   return parseFloat( number );
 * }
 *
 * parsePrice( '1.234,50 €', { thousandSeparator: '.', decimalSeparator: ',' } ); // 1234.5
 *
 * @example
 * // Real-life use case: replacing several placeholder tokens in one pass
 * // Tokens contain "{" and "}", which are regex syntax.
 * function fillTemplate( template, values ) {
 *   const pattern = new RegExp(
 *     Object.keys( values ).map( ( key ) => escapeRegex( `{${ key }}` ) ).join( '|' ),
 *     'g'
 *   );
 *
 *   return template.replace( pattern, ( token ) => values[ token.slice( 1, -1 ) ] );
 * }
 *
 * fillTemplate( 'Add {amount} more for free shipping to {country}.', {
 *   amount: '$12.00',
 *   country: 'Canada',
 * } ); // 'Add $12.00 more for free shipping to Canada.'
 *
 * @example
 * // Real-life use case: splitting a setting on a configurable separator
 * // A separator of "|" or "." would otherwise mean "or" or "any character".
 * function splitList( value, separator = '|' ) {
 *   return value.split( new RegExp( `\\s*${ escapeRegex( separator ) }\\s*` ) );
 * }
 *
 * splitList( 'red | blue | green' ); // [ 'red', 'blue', 'green' ]
 * splitList( 's.m.l', '.' );         // [ 's', 'm', 'l' ]
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape RegExp.escape()
 * @see https://tc39.es/proposal-regex-escaping/ RegExp.escape specification
 *
 * @since 0.6.0
 */
function escapeRegex(string) {
  if (typeof string !== 'string') {
    throw new TypeError('escapeRegex: expected a string.');
  }
  return typeof RegExp.escape === 'function' ? RegExp.escape(string) : escapeRegexFallback(string);
}