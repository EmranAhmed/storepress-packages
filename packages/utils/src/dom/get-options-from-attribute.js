'use strict';
/**
 * Internal dependencies
 */
import { getElement } from './get-element.js';
import { isPlainObject } from '../object/is-plain-object.js';
import { toCamelCase } from '../string/to-camel-case.js';
import { toKebabCase } from '../string/to-kebab-case.js';

/**
 * Strings that convert to numbers: optional minus sign, no leading zeros,
 * optional decimals. Rejects '', whitespace, hex, exponents and Infinity, so
 * values such as zip codes ("01234") stay strings.
 *
 * @private
 *
 * @type {RegExp}
 */
const OPTION_NUMBER_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?$/;

/**
 * Regex literals written as strings: "/pattern/flags". Flags are limited to
 * the ones JavaScript supports.
 *
 * @private
 *
 * @type {RegExp}
 */
const OPTION_REGEX_PATTERN = /^\/(.+)\/([dgimsuvy]*)$/;

/**
 * Regex metacharacters. A "/pattern/" without flags is only treated as a regex
 * when the pattern contains one of these, so paths such as "/shop/" stay strings.
 *
 * @private
 *
 * @type {RegExp}
 */
const OPTION_REGEX_META = /[\\^$.*+?()[\]{}|]/;

/**
 * Checks whether a string converts to a number without losing information.
 * Integers must be safe integers, so long IDs keep their exact digits.
 *
 * @private
 *
 * @param {string} value - Trimmed string to check.
 *
 * @return {boolean} True when `Number( value )` is exact and intended.
 *
 * @example
 * // Plain decimals convert
 * isNumericOptionString( '42' );    // true
 * isNumericOptionString( '-3.14' ); // true
 * isNumericOptionString( '1.50' );  // true
 *
 * @example
 * // Values that would lose information stay strings
 * isNumericOptionString( '01234' );                // false (leading zero, e.g. a zip code)
 * isNumericOptionString( '0x10' );                 // false (hex)
 * isNumericOptionString( '1e3' );                  // false (exponent)
 * isNumericOptionString( ' 42' );                  // false (caller must trim first)
 * isNumericOptionString( '12345678901234567890' ); // false (not a safe integer)
 */
function isNumericOptionString( value ) {
	if ( ! OPTION_NUMBER_PATTERN.test( value ) ) {
		return false;
	}

	const number = Number( value );

	return ! Number.isInteger( number ) || Number.isSafeInteger( number );
}

/**
 * Converts a "/pattern/flags" string to a RegExp.
 *
 * A pattern without flags must contain a regex metacharacter, so path-like
 * strings ("/shop/", "/cart/") are not converted. Invalid patterns log a
 * warning and return null.
 *
 * @private
 *
 * @param {string} value - String to convert.
 *
 * @return {RegExp|null} The RegExp, or null when the string is not a regex literal.
 *
 * @example
 * // Regex literals convert
 * optionStringToRegExp( '/^test$/i' ); // /^test$/i
 * optionStringToRegExp( '/\\d+/' );    // /\d+/
 * optionStringToRegExp( '/sale/gi' );  // /sale/gi (flags make it a regex)
 *
 * @example
 * // Paths and invalid patterns are not converted
 * optionStringToRegExp( '/shop/' ); // null (path: no metacharacters or flags)
 * optionStringToRegExp( '/a/x' );   // null ("x" is not a JavaScript flag)
 * optionStringToRegExp( '/(/g' );   // null (invalid pattern, logs a warning)
 * optionStringToRegExp( 'shop' );   // null (no slashes)
 */
function optionStringToRegExp( value ) {
	const match = value.match( OPTION_REGEX_PATTERN );

	if ( ! match ) {
		return null;
	}

	const [ , pattern, flags ] = match;

	if ( flags === '' && ! OPTION_REGEX_META.test( pattern ) ) {
		return null;
	}

	try {
		return new RegExp( pattern, flags );
	} catch ( error ) {
		console.warn( `Invalid regex pattern: ${ value }`, error );
		return null;
	}
}

/**
 * Converts relaxed, single-quoted object notation to strict JSON.
 *
 * Scans the input character by character and only rewrites quotes that
 * delimit strings, so apostrophes and double quotes inside values survive.
 * Inside single-quoted strings:
 * - `\'` becomes an apostrophe.
 * - `"` is escaped.
 * - Other backslashes are kept literally, so "C:\new" and "/\d+/" stay intact.
 * Double-quoted strings are copied unchanged, so both styles can be mixed.
 *
 * @private
 *
 * @param {string} input - Relaxed notation, e.g. `{'title': 'It\'s here'}`.
 *
 * @return {string} Strict JSON, e.g. `{"title": "It's here"}`.
 *
 * @example
 * // Quotes inside single-quoted values survive
 * toStrictOptionsJSON( "{'title': 'It\\'s here'}" ); // '{"title": "It\'s here"}'
 * toStrictOptionsJSON( "{'a': 'say \"hi\"'}" );      // '{"a": "say \\"hi\\""}'
 *
 * @example
 * // Backslashes are kept literally; double-quoted strings are copied unchanged
 * toStrictOptionsJSON( "{'re': '/\\d+/'}" ); // '{"re": "/\\\\d+/"}'
 * toStrictOptionsJSON( `{'path': 'C:\\new', "mixed": "a'b"}` );
 * // '{"path": "C:\\\\new", "mixed": "a\'b"}'
 */
function toStrictOptionsJSON( input ) {
	let output = '';
	let quote = null; // Current string delimiter, or null outside strings.

	for ( let index = 0; index < input.length; index++ ) {
		const char = input[ index ];

		// Outside a string: copy, and open a string on either quote.
		if ( quote === null ) {
			if ( char === "'" || char === '"' ) {
				quote = char;
				output += '"';
			} else {
				output += char;
			}
			continue;
		}

		// Inside a double-quoted string: copy as-is, honoring escapes.
		if ( quote === '"' ) {
			output += char;
			if ( char === '\\' ) {
				index++;
				output += input[ index ] ?? '';
			} else if ( char === '"' ) {
				quote = null;
			}
			continue;
		}

		// Inside a single-quoted string.
		if ( char === '\\' && input[ index + 1 ] === "'" ) {
			output += "'";
			index++;
		} else if ( char === '\\' ) {
			output += '\\\\';
		} else if ( char === '"' ) {
			output += '\\"';
		} else if ( char === "'" ) {
			quote = null;
			output += '"';
		} else {
			output += char;
		}
	}

	return output;
}

/**
 * Parses strict JSON first, then relaxed single-quoted notation.
 *
 * Strict JSON is always tried first, so valid JSON is never altered. Each
 * format gets its own reviver, so strict JSON can keep its types while
 * hand-written relaxed notation has its quoted values converted.
 *
 * @private
 *
 * @param {string}                         value                          - JSON or relaxed notation.
 * @param {( key: string, value: * ) => *} [strictReviver]                - JSON.parse reviver used for strict JSON.
 * @param {( key: string, value: * ) => *} [relaxedReviver=strictReviver] - JSON.parse reviver used for relaxed notation.
 *
 * @throws {SyntaxError} When neither format parses.
 *
 * @return {*} The parsed value.
 *
 * @example
 * // Strict JSON first, relaxed notation as a fallback
 * parseOptionsJSON( '{"title": "It\'s here"}' ); // { title: "It's here" }
 * parseOptionsJSON( "{'title': 'Hi'}" );         // { title: 'Hi' }
 * parseOptionsJSON( '{oops' );                   // throws SyntaxError
 *
 * @example
 * // The relaxed reviver only runs for relaxed notation
 * const toNumber = ( key, value ) => ( value === '5' ? 5 : value );
 * parseOptionsJSON( "{'n': '5'}", undefined, toNumber ); // { n: 5 }
 * parseOptionsJSON( '{"n": "5"}', undefined, toNumber ); // { n: '5' }
 */
function parseOptionsJSON(
	value,
	strictReviver,
	relaxedReviver = strictReviver
) {
	try {
		return JSON.parse( value, strictReviver );
	} catch {
		// Not strict JSON: fall through to relaxed notation.
	}

	return JSON.parse( toStrictOptionsJSON( value ), relaxedReviver );
}

/**
 * Reads a plugin's configuration options from an element's `data-*` attributes.
 *
 * StorePress plugins are configured from HTML: PHP (or a block) prints the
 * settings into a data attribute, and the JavaScript plugin reads them when it
 * starts. Two sources are combined, and overrides win:
 * 1. **Main attribute** `data-{name}`: an object written as JSON
 *    (`{"speed": 300}`) or as relaxed single-quoted notation (`{'speed': 300}`).
 * 2. **Override attributes** `data-{name}--{key}`: one attribute per option.
 *    Each `--` starts a nested level, and single hyphens become camelCase:
 *    `data-slider--speed-limit` sets `speedLimit`, and
 *    `data-slider--animation--duration` sets `animation.duration`.
 *
 * Use it in a plugin constructor to merge server settings and per-element
 * tweaks on top of JavaScript defaults, so one plugin can be configured
 * differently on every element without extra JavaScript.
 *
 * How values are converted:
 *
 * | Value                                      | Override attribute     | Main attribute: strict JSON | Main attribute: relaxed |
 * | ------------------------------------------ | ---------------------- | --------------------------- | ----------------------- |
 * | No value (`data-x--autoplay`)              | `true` (`emptyValue`)  | -                           | -                       |
 * | `"yes"`, `"true"` / `"no"`, `"false"`      | `true` / `false`       | Kept as string              | `true` / `false`        |
 * | `"42"`, `"-3.14"`                          | Number                 | Kept as string              | Number                  |
 * | `"01234"`, `"0x10"`, `"1e3"`, unsafe ints  | String                 | String                      | String                  |
 * | `"/^a/i"`, `"/\d+/"`                       | RegExp                 | RegExp                      | RegExp                  |
 * | `"/shop/"` (no flags, no metacharacters)   | String                 | String                      | String                  |
 * | `'["a","b"]'`, `'{"w": 1}'`                | Array / object         | Native JSON value           | Native value            |
 * | Anything else                              | String (untrimmed)     | String                      | String                  |
 *
 * Notes:
 * - Strict JSON is usually generated (for example by `wp_json_encode()`), so its
 *   quoting is treated as deliberate and string values keep their type. Only
 *   regex strings are converted, because JSON has no regex type. Relaxed
 *   notation is usually hand-written with every value quoted, so its strings are
 *   converted like override attributes. `convertJSONStrings: true` converts
 *   both; `false` converts neither.
 * - Put values that must keep their exact form (SKUs, zip codes, long IDs,
 *   version strings) in strict JSON, or set `parseNumber: false`.
 * - HTML lowercases attribute names. Write `data-x--speed-limit` for
 *   `speedLimit`; `data-x--speedLimit` becomes `speedlimit`.
 * - `dataAttributeName` may be kebab or camel case (`'storepress-slider'` or
 *   `'storepressSlider'`). A leading `data-` is removed only in kebab form:
 *   `'dataSlider'` reads `data-data-slider`.
 * - Invalid JSON never throws: a warning is logged and that source is ignored.
 *   A main attribute that is not an object (for example `[1, 2]`) is ignored too.
 * - A parent override with its own value plus child overrides
 *   (`data-x--nav="5"` and `data-x--nav--next="a"`) conflict. The children win
 *   and a warning is logged.
 * - `__proto__` keys are dropped, so options can never replace a prototype.
 * - Selector strings go through `getElement()`, so an empty or invalid
 *   selector throws a `SyntaxError`. Missing elements, `document` and elements
 *   from another frame return `{}`.
 * - The attributes are read once per call. Call it again after changing
 *   attributes; nothing is cached or observed.
 *
 * @param {string|Element} element                                     - Element (HTML or SVG), or a CSS selector for one.
 * @param {string}         dataAttributeName                           - Attribute name without `data-`, e.g. `'storepress-slider'`.
 * @param {Object}         [userFeatures={}]                           - Parsing options.
 * @param {boolean}        [userFeatures.parseNumber=true]             - Convert numeric strings to numbers.
 * @param {boolean}        [userFeatures.parseBoolean=true]            - Convert `truthyStrings` and `falsyStrings` to booleans.
 * @param {string[]}       [userFeatures.truthyStrings=['yes','true']] - Strings converted to `true` (case-insensitive).
 * @param {string[]}       [userFeatures.falsyStrings=['no','false']]  - Strings converted to `false` (case-insensitive).
 * @param {boolean}        [userFeatures.parseRegex=true]              - Convert `"/pattern/flags"` strings to RegExp, in overrides and in JSON.
 * @param {boolean}        [userFeatures.parseJSON=true]               - Parse override values that start with `[` or `{` as JSON.
 * @param {*}              [userFeatures.emptyValue=true]              - Value for override attributes with no value, e.g. `data-x--autoplay`.
 * @param {boolean|'auto'} [userFeatures.convertJSONStrings='auto']    - Convert string values in the main attribute: `'auto'` (relaxed notation only), `true` (always) or `false` (never).
 *
 * @return {Object} A new plain object of options; `{}` when the element or attributes are missing.
 *
 * @throws {SyntaxError} When `element` is an empty or invalid CSS selector.
 *
 * @example
 * // At a glance: main attribute plus override attributes
 * // <div class="box"
 * //      data-box='{"speed": 300, "label": "Sale"}'
 * //      data-box--enabled="yes"
 * //      data-box--count="42"
 * //      data-box--speed-limit="1000"
 * //      data-box--pattern="/^test$/i"
 * //      data-box--items='["a", "b"]'
 * //      data-box--size='{"width": 300}'
 * //      data-box--autoplay
 * //      data-box--zip="01234"
 * //      data-box--hex="0x10"
 * //      data-box--path="/shop/"
 * //      data-box--axis="y"></div>
 * getOptionsFromAttribute( '.box', 'box' );
 * // {
 * //   speed: 300,
 * //   label: 'Sale',
 * //   enabled: true,        // "yes" is in truthyStrings
 * //   count: 42,
 * //   speedLimit: 1000,     // single hyphen => camelCase
 * //   pattern: /^test$/i,
 * //   items: [ 'a', 'b' ],
 * //   size: { width: 300 },
 * //   autoplay: true,       // no value => emptyValue
 * //   zip: '01234',         // leading zero => stays a string
 * //   hex: '0x10',          // only plain decimals become numbers
 * //   path: '/shop/',       // no flags or metacharacters => stays a string
 * //   axis: 'y',            // not in truthyStrings/falsyStrings
 * // }
 *
 * getOptionsFromAttribute( '.missing', 'box' ); // {}
 * getOptionsFromAttribute( document, 'box' );   // {}
 *
 * @example
 * // Real-life use case: plugin defaults + server settings + per-product override
 * // PHP prints the gallery settings; one product turns zoom off in its template.
 * // <div class="storepress-gallery"
 * //      data-storepress-gallery="<?php echo esc_attr( wp_json_encode( $settings ) ); ?>"
 * //      data-storepress-gallery--zoom="false"></div>
 * // $settings = [ 'thumbnails' => 'bottom', 'zoom' => true, 'slidesPerView' => 4 ];
 * const DEFAULTS = { thumbnails: 'left', zoom: true, slidesPerView: 3, loop: false };
 *
 * class ProductGallery {
 *   constructor( $element, options = {} ) {
 *     this.options = {
 *       ...DEFAULTS,
 *       ...options, // From JavaScript
 *       ...getOptionsFromAttribute( $element, 'storepress-gallery' ), // HTML wins
 *     };
 *   }
 * }
 *
 * // new ProductGallery( $gallery ).options
 * // { thumbnails: 'bottom', zoom: false, slidesPerView: 4, loop: false }
 *
 * @example
 * // Real-life use case: hand-written settings in a theme template
 * // Relaxed notation is easier to write inside a double-quoted attribute.
 * // <ul class="variation-swatches"
 * //     data-swatches="{'attribute': 'pa_color', 'tooltip': 'true', 'limit': '5', 'label': 'It\'s on sale'}"></ul>
 * getOptionsFromAttribute( '.variation-swatches', 'swatches' );
 * // { attribute: 'pa_color', tooltip: true, limit: 5, label: "It's on sale" }
 *
 * // Strict JSON from wp_json_encode() keeps its strings:
 * // <div class="product" data-product='{"sku": "00123", "featured": "yes", "stock": "12", "match": "/^a/i"}'></div>
 * getOptionsFromAttribute( '.product', 'product' );
 * // { sku: '00123', featured: 'yes', stock: '12', match: /^a/i }
 *
 * getOptionsFromAttribute( '.product', 'product', { convertJSONStrings: true } );
 * // { sku: '00123', featured: true, stock: 12, match: /^a/i }
 *
 * @example
 * // Real-life use case: nested options from a page builder
 * // The builder prints one attribute per control; "--" creates nested options.
 * // <aside class="cart-drawer"
 * //        data-cart-drawer='{"position": "right", "animation": {"easing": "linear", "duration": 200}}'
 * //        data-cart-drawer--animation--duration="350"
 * //        data-cart-drawer--overlay--close-on-click="true"
 * //        data-cart-drawer--auto-open></aside>
 * getOptionsFromAttribute( '.cart-drawer', 'cart-drawer' );
 * // {
 * //   position: 'right',
 * //   animation: { easing: 'linear', duration: 350 }, // merged, not replaced
 * //   autoOpen: true,
 * //   overlay: { closeOnClick: true },
 * // }
 *
 * @example
 * // Real-life use case: custom parsing for a product filter widget
 * // Category IDs must stay strings, and the widget uses "on"/"off" switches.
 * // <form class="product-filter"
 * //       data-filter--category-id="2024"
 * //       data-filter--active="ON"
 * //       data-filter--compact
 * //       data-filter--sku="/^SKU-\d+$/"></form>
 * getOptionsFromAttribute( '.product-filter', 'filter', {
 *   parseNumber: false,
 *   truthyStrings: [ 'on', 'yes' ],
 *   falsyStrings: [ 'off', 'no' ],
 *   emptyValue: false,
 * } );
 * // { categoryId: '2024', active: true, compact: false, sku: /^SKU-\d+$/ }
 *
 * // With the default features:
 * // { categoryId: 2024, active: 'ON', compact: true, sku: /^SKU-\d+$/ }
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-* data-* attributes
 * @see getElement
 *
 * @since 0.6.0
 */
export function getOptionsFromAttribute(
	element,
	dataAttributeName,
	userFeatures = {}
) {
	const FEATURES = {
		parseNumber: true,
		parseBoolean: true,
		truthyStrings: [ 'yes', 'true' ],
		falsyStrings: [ 'no', 'false' ],
		parseRegex: true,
		parseJSON: true,
		emptyValue: true,
		convertJSONStrings: 'auto',
		...userFeatures,
	};

	// Accept elements directly (including SVG), or resolve a selector.
	const $element =
		element instanceof Element ? element : getElement( element );

	if ( ! ( $element instanceof Element ) ) {
		return {};
	}

	const name = toKebabCase(
		String( dataAttributeName ).replace( /^data-/, '' )
	);
	const attributeName = `data-${ name }`;
	const overridePrefix = `${ attributeName }--`;

	// Lowercase once, so user lists like [ 'Y' ] match case-insensitively.
	const truthyStrings = FEATURES.truthyStrings.map( ( item ) =>
		String( item ).toLowerCase()
	);
	const falsyStrings = FEATURES.falsyStrings.map( ( item ) =>
		String( item ).toLowerCase()
	);

	/**
	 * Converts a string to a boolean, RegExp or number when the matching
	 * feature is enabled. Otherwise returns the original string.
	 *
	 * @private
	 *
	 * @param {string} value - String to convert.
	 *
	 * @return {*} Converted value, or the original string.
	 *
	 * @example
	 * // With the default features
	 * convertString( 'Yes' );   // true
	 * convertString( '/^a/i' ); // /^a/i
	 * convertString( ' 42 ' );  // 42
	 *
	 * @example
	 * // Unconverted values are returned untrimmed
	 * convertString( '01234' ); // '01234'
	 * convertString( 'ON' );    // 'ON' (not in truthyStrings)
	 * convertString( ' Hi ' );  // ' Hi '
	 */
	const convertString = ( value ) => {
		const trimmed = value.trim();
		const lowerValue = trimmed.toLowerCase();

		if ( FEATURES.parseBoolean ) {
			if ( truthyStrings.includes( lowerValue ) ) {
				return true;
			}
			if ( falsyStrings.includes( lowerValue ) ) {
				return false;
			}
		}

		if ( FEATURES.parseRegex ) {
			const regex = optionStringToRegExp( trimmed );
			if ( regex ) {
				return regex;
			}
		}

		if ( FEATURES.parseNumber && isNumericOptionString( trimmed ) ) {
			return Number( trimmed );
		}

		return value;
	};

	/**
	 * Creates a JSON.parse reviver. Every reviver drops `__proto__` keys.
	 * String values are either fully converted (booleans, regex, numbers) or
	 * only checked for regex, since JSON has no regex type.
	 *
	 * @private
	 *
	 * @param {boolean} convertStrings - Convert string values like override attributes.
	 *
	 * @return {( key: string, value: * ) => *} Reviver for JSON.parse.
	 *
	 * @example
	 * // Strict JSON (default 'auto'): strings keep their type, regex strings convert
	 * JSON.parse( '{"stock": "12", "on": "yes", "re": "/^a/i"}', createReviver( false ) );
	 * // { stock: '12', on: 'yes', re: /^a/i }
	 *
	 * @example
	 * // Relaxed notation: strings convert like override attributes
	 * JSON.parse( '{"stock": "12", "on": "yes", "zip": "01234"}', createReviver( true ) );
	 * // { stock: 12, on: true, zip: '01234' }
	 *
	 * JSON.parse( '{"__proto__": {"x": 1}, "a": 1}', createReviver( true ) );
	 * // { a: 1 }
	 */
	const createReviver = ( convertStrings ) => ( key, value ) => {
		// Never let parsed data replace a prototype when it is merged later.
		if ( key === '__proto__' ) {
			return undefined;
		}

		if ( typeof value !== 'string' || value === '' ) {
			return value;
		}

		if ( convertStrings ) {
			return convertString( value );
		}

		return FEATURES.parseRegex
			? ( optionStringToRegExp( value ) ?? value )
			: value;
	};

	// 'auto': strict JSON keeps its types, relaxed notation is converted.
	const strictReviver = createReviver( FEATURES.convertJSONStrings === true );
	const relaxedReviver = createReviver(
		FEATURES.convertJSONStrings === true ||
			FEATURES.convertJSONStrings === 'auto'
	);

	/**
	 * Converts an override attribute value. Empty values become `emptyValue`,
	 * JSON-looking values are parsed, everything else goes through convertString.
	 *
	 * @private
	 *
	 * @param {string} value     - Raw attribute value.
	 * @param {string} attribute - Attribute name, used in warnings.
	 *
	 * @return {*} Converted value.
	 *
	 * @example
	 * // Empty values and plain strings
	 * convertOverride( '', 'data-x--autoplay' ); // true (emptyValue)
	 * convertOverride( 'false', 'data-x--loop' ); // false
	 *
	 * @example
	 * // JSON-looking values
	 * convertOverride( '["a"]', 'data-x--items' ); // [ 'a' ]
	 * convertOverride( '{oops', 'data-x--bad' );   // '{oops' (logs a warning)
	 */
	const convertOverride = ( value, attribute ) => {
		if ( value === '' ) {
			return FEATURES.emptyValue;
		}

		const trimmed = value.trim();

		if (
			FEATURES.parseJSON &&
			( trimmed.startsWith( '[' ) || trimmed.startsWith( '{' ) )
		) {
			try {
				return parseOptionsJSON(
					trimmed,
					strictReviver,
					relaxedReviver
				);
			} catch ( error ) {
				console.warn(
					`Failed to parse JSON from "${ attribute }", using it as a string.`,
					error
				);
				return value;
			}
		}

		return convertString( value );
	};

	/**
	 * Merges override options into base options. Only plain objects are merged
	 * recursively; arrays, RegExp and other values are replaced.
	 *
	 * @private
	 *
	 * @param {Object} base  - Options from the main attribute.
	 * @param {Object} extra - Options from override attributes (wins).
	 *
	 * @return {Object} New merged object. Inputs are not modified.
	 *
	 * @example
	 * // Plain objects merge recursively
	 * mergeOptions( { a: { x: 1 } }, { a: { y: 2 } } );
	 * // { a: { x: 1, y: 2 } }
	 *
	 * @example
	 * // Arrays and RegExp are replaced, not merged
	 * mergeOptions( { list: [ 1, 2 ], re: /a+/ }, { list: [ 3 ], re: /b+/ } );
	 * // { list: [ 3 ], re: /b+/ }
	 */
	const mergeOptions = ( base, extra ) => {
		const result = { ...base };

		for ( const [ key, value ] of Object.entries( extra ) ) {
			result[ key ] =
				isPlainObject( value ) && isPlainObject( result[ key ] )
					? mergeOptions( result[ key ], value )
					: value;
		}

		return result;
	};

	// 1. Main attribute.
	let options = {};
	const json = $element.getAttribute( attributeName );

	if ( json && json.trim() ) {
		try {
			const parsed = parseOptionsJSON(
				json.trim(),
				strictReviver,
				relaxedReviver
			);

			if ( isPlainObject( parsed ) ) {
				options = parsed;
			} else {
				console.warn(
					`"${ attributeName }" must contain a JSON object.`,
					parsed
				);
			}
		} catch ( error ) {
			console.warn(
				`Failed to parse JSON from "${ attributeName }"`,
				error
			);
		}
	}

	// 2. Override attributes, read from attribute names so HTML's lowercase
	// names map directly: "--" starts a level, "-" becomes camelCase.
	const overrides = [];

	for ( const attribute of $element.getAttributeNames() ) {
		if ( ! attribute.startsWith( overridePrefix ) ) {
			continue;
		}

		const path = attribute
			.slice( overridePrefix.length )
			.split( '--' )
			.map( ( segment ) => toCamelCase( segment ) );

		const isValidPath = path.every(
			( segment ) => segment !== '' && segment !== '__proto__'
		);

		if ( ! isValidPath ) {
			console.warn(
				`Ignoring invalid option attribute "${ attribute }".`
			);
			continue;
		}

		overrides.push( { attribute, path } );
	}

	// Shallow paths first, so deeper overrides land inside their parents.
	overrides.sort( ( a, b ) => a.path.length - b.path.length );

	const overrideOptions = {};

	for ( const { attribute, path } of overrides ) {
		const value = convertOverride(
			$element.getAttribute( attribute ),
			attribute
		);
		const lastIndex = path.length - 1;
		let target = overrideOptions;

		for ( let index = 0; index < lastIndex; index++ ) {
			const segment = path[ index ];

			if ( ! isPlainObject( target[ segment ] ) ) {
				if ( Object.hasOwn( target, segment ) ) {
					console.warn(
						`"${ attribute }" replaces the value of "${ path
							.slice( 0, index + 1 )
							.join( '.' ) }" with nested options.`
					);
				}
				target[ segment ] = {};
			}

			target = target[ segment ];
		}

		target[ path[ lastIndex ] ] = value;
	}

	// 3. Overrides win over the main attribute.
	return mergeOptions( options, overrideOptions );
}
