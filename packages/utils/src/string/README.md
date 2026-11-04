# String utilities

Helpers for converting identifiers between naming styles (camelCase, kebab-case, snake_case and others) and for using text safely inside regular expressions. StorePress uses them to map data attributes, PHP settings, CSS names and plugin namespaces to one another.

```js
import {
	toCamelCase,
	toUpperCamelCase,
	toKebabCase,
	toSnakeCase,
	toConstantCase,
	escapeRegex,
} from '@storepress/utils';
```

| Function                                | Description                                                              |
| --------------------------------------- | ------------------------------------------------------------------------ |
| [`toCamelCase`](#tocamelcase)           | Converts a separated or capitalized string to `camelCase`.               |
| [`toUpperCamelCase`](#touppercamelcase) | Converts a string to `UpperCamelCase`, with a `StorePress` special case. |
| [`toKebabCase`](#tokebabcase)           | Converts a string to `kebab-case`.                                       |
| [`toSnakeCase`](#tosnakecase)           | Converts a string to `snake_case`.                                       |
| [`toConstantCase`](#toconstantcase)     | Converts a string to `CONSTANT_CASE`.                                    |
| [`escapeRegex`](#escaperegex)           | Escapes regex special characters so text matches literally.              |

All case converters treat `-`, `_`, `.`, `:`, `~` and whitespace as word separators. They all require a string: `null`, `undefined` and numbers throw a `TypeError`.

### Quick comparison

| Input                | `toCamelCase`      | `toUpperCamelCase` | `toKebabCase`        | `toSnakeCase`        | `toConstantCase`    |
| -------------------- | ------------------ | ------------------ | -------------------- | -------------------- | ------------------- |
| `'product-gallery'`  | `'productGallery'` | `'ProductGallery'` | `'product-gallery'`  | `'product_gallery'`  | `'PRODUCT_GALLERY'` |
| `'addToCart'`        | `'addToCart'`      | `'AddToCart'`      | `'add-to-cart'`      | `'add_to_cart'`      | `'ADD_TO_CART'`     |
| `'HELLO_WORLD'`      | `'helloWorld'`     | `'HelloWorld'`     | `'hello-world'`      | `'hello_world'`      | `'HELLO_WORLD'`     |
| `'foo--bar'`         | `'fooBar'`         | `'FooBar'`         | `'foo-bar'`          | `'foo_bar'`          | `'FOO_BAR'`         |
| `'  padded value  '` | `'paddedValue'`    | `'PaddedValue'`    | `'padded-value'`     | `'padded_value'`     | `'PADDED_VALUE'`    |
| `'XMLHttpRequest'`   | `'xmlHttpRequest'` | `'XmlHttpRequest'` | `'xml-http-request'` | `'xml_http_request'` | `'XMLHTTP_REQUEST'` |

---

## toCamelCase

Converts a separated or capitalized string to camelCase. The input is split into words at separators and case changes; the first word is lowercased, each later word is capitalized, and the words are joined.

```js
toCamelCase( string: string ): string
```

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| `string`  | `string` | —       | Text to convert. |

**Returns:** `string`, the camelCase text.

**Use case:** turning snake_case keys from PHP (`wp_localize_script`, REST responses), kebab-case CSS or attribute names, and dotted paths into JavaScript property names.

```js
toCamelCase( 'product-gallery' ); // 'productGallery'
toCamelCase( 'variation_swatches' ); // 'variationSwatches'
toCamelCase( 'HelloWorld' ); // 'helloWorld'
toCamelCase( 'HELLO_WORLD' ); // 'helloWorld'
toCamelCase( 'sku-123' ); // 'sku123'
```

```js
// Normalize settings passed from PHP.
const settings = { ajax_url: '/wp-admin/admin-ajax.php', cart_hash: 'a1b2c3' };

const config = Object.fromEntries(
	Object.entries( settings ).map( ( [ key, value ] ) => [
		toCamelCase( key ),
		value,
	] )
);
// { ajaxUrl: '/wp-admin/admin-ajax.php', cartHash: 'a1b2c3' }
```

```js
// Apply kebab-case swatch styles through element.style.
const swatchStyles = { 'background-color': '#c0392b', 'border-radius': '50%' };

Object.entries( swatchStyles ).forEach( ( [ property, value ] ) => {
	$swatch.style[ toCamelCase( property ) ] = value;
} );
```

**Notes:**

- Each word is lowercased first, so all-caps input works: `'HELLO_WORLD'` becomes `'helloWorld'`.
- Acronyms become one word: `'XMLHttpRequest'` becomes `'xmlHttpRequest'`.
- Repeated, leading and trailing separators and whitespace are ignored: `'  --foo--bar--  '` becomes `'fooBar'`.

---

## toUpperCamelCase

Converts a string to UpperCamelCase (PascalCase). Works like `toCamelCase`, but capitalizes the first word too. StorePress uses it to name plugin entries on the global `window.StorePress` object.

```js
toUpperCamelCase( string: string ): string
```

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| `string`  | `string` | —       | Text to convert. |

**Returns:** `string`, the UpperCamelCase text.

**Use case:** global namespace keys, component and class names taken from markup, and handler method names built from event types.

```js
toUpperCamelCase( 'product-gallery' ); // 'ProductGallery'
toUpperCamelCase( 'cart drawer' ); // 'CartDrawer'
toUpperCamelCase( 'storepress' ); // 'StorePress'
toUpperCamelCase( 'storepress-tabs' ); // 'StorepressTabs'
```

```js
// Mount components named in the markup: <div data-component="cart-drawer"></div>
const components = { CartDrawer, MiniCart };

document.querySelectorAll( '[data-component]' ).forEach( ( $element ) => {
	const Component =
		components[ toUpperCamelCase( $element.dataset.component ) ];
	if ( Component ) {
		new Component( $element );
	}
} );
```

```js
// Route WooCommerce events to handler methods: show_variation → onShowVariation.
handleEvent( event ) {
	this[ `on${ toUpperCamelCase( event.type ) }` ]?.( event );
}
```

**Notes:**

- The whole string `'storepress'`, in any letter case, returns `'StorePress'`. The special case does not apply inside longer strings.
- Each word is lowercased first: `'HELLO_WORLD'` becomes `'HelloWorld'`, and `'XMLHttpRequest'` becomes `'XmlHttpRequest'`.
- Repeated, leading and trailing separators and whitespace are ignored: `'foo--bar'` becomes `'FooBar'`.

---

## toKebabCase

Converts a camelCase, snake_case, dotted or spaced string to kebab-case. The input is split into words at separators and case changes; the words are lowercased and joined with hyphens.

```js
toKebabCase( string: string ): string
```

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| `string`  | `string` | —       | Text to convert. |

**Returns:** `string`, the kebab-case text.

**Use case:** HTML data attribute names, CSS class names, CSS custom properties and custom event names.

```js
toKebabCase( 'autoplaySpeed' ); // 'autoplay-speed'
toKebabCase( 'ProductGallery' ); // 'product-gallery'
toKebabCase( '  padded value  ' ); // 'padded-value'
toKebabCase( 'XMLHttpRequest' ); // 'xml-http-request'
```

```js
// Expose gallery settings as CSS custom properties: --sp-thumb-size, --sp-gap-size.
const settings = { thumbSize: '80px', gapSize: '12px' };

Object.entries( settings ).forEach( ( [ key, value ] ) => {
	$gallery.style.setProperty( `--sp-${ toKebabCase( key ) }`, value );
} );
```

```js
// Write options back to data attributes: data-autoplay-speed="3000".
Object.entries( { autoplaySpeed: 3000 } ).forEach( ( [ key, value ] ) => {
	$slider.setAttribute( `data-${ toKebabCase( key ) }`, value );
} );
```

**Notes:**

- Repeated, leading and trailing separators and whitespace are ignored: `'foo__bar'` and `'foo - bar'` both become `'foo-bar'`.
- An acronym is one word: `'XMLHttpRequest'` becomes `'xml-http-request'`.

---

## toSnakeCase

Converts a camelCase, kebab-case, dotted or spaced string to snake_case. Same rules as `toKebabCase`, with underscores instead of hyphens.

```js
toSnakeCase( string: string ): string
```

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| `string`  | `string` | —       | Text to convert. |

**Returns:** `string`, the snake_case text.

**Use case:** keys sent to PHP (`admin-ajax.php` requests, option names), WooCommerce attribute taxonomy slugs, and storage keys.

```js
toSnakeCase( 'variationId' ); // 'variation_id'
toSnakeCase( 'product-gallery' ); // 'product_gallery'
toSnakeCase( 'Screen Size' ); // 'screen_size'
```

```js
// Send an add-to-cart request; PHP reads $_POST['product_id'] and $_POST['variation_id'].
const body = new FormData();
body.append( 'action', 'storepress_add_to_cart' );

Object.entries( { productId: 42, variationId: 57, quantity: 2 } ).forEach(
	( [ key, value ] ) => {
		body.append( toSnakeCase( key ), value );
	}
);
```

```js
// Find the select for a global WooCommerce attribute.
const taxonomy = `pa_${ toSnakeCase( 'Screen Size' ) }`; // 'pa_screen_size'
const $select = document.querySelector(
	`select[name="attribute_${ taxonomy }"]`
);
```

**Notes:**

- Repeated, leading and trailing separators and whitespace are ignored: `'foo--bar'` becomes `'foo_bar'`.
- An acronym is one word: `'XMLHttpRequest'` becomes `'xml_http_request'`.

---

## toConstantCase

Converts a camelCase, kebab-case, dotted or spaced string to CONSTANT_CASE. Inserts an underscore before a capital that follows a lowercase letter or digit, turns each run of separators into one underscore, trims underscores from the ends and uppercases the result.

```js
toConstantCase( string: string ): string
```

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| `string`  | `string` | —       | Text to convert. |

**Returns:** `string`, the CONSTANT_CASE text.

**Use case:** constant names, action types, and keys for status or message maps.

```js
toConstantCase( 'addToCart' ); // 'ADD_TO_CART'
toConstantCase( 'out-of-stock' ); // 'OUT_OF_STOCK'
toConstantCase( 'HELLO_WORLD' ); // 'HELLO_WORLD'
toConstantCase( 'foo--bar' ); // 'FOO_BAR'
```

```js
// Label WooCommerce order statuses: 'on-hold' → STATUS_LABELS.ON_HOLD.
const STATUS_LABELS = {
	PROCESSING: __( 'Being prepared', 'storepress' ),
	ON_HOLD: __( 'On hold', 'storepress' ),
};

const label = STATUS_LABELS[ toConstantCase( order.status ) ] ?? order.status;
```

```js
// Build an event-name constant map.
const EVENTS = Object.fromEntries(
	[ 'cart-updated', 'drawer-opened' ].map( ( name ) => [
		toConstantCase( name ),
		`storepress:${ name }`,
	] )
);
// { CART_UPDATED: 'storepress:cart-updated', DRAWER_OPENED: 'storepress:drawer-opened' }
```

**Notes:**

- Repeated, leading and trailing separators are collapsed or removed: `'foo--bar'` becomes `'FOO_BAR'`.
- Runs of capitals are not split, unlike the other converters: `'XMLHttpRequest'` becomes `'XMLHTTP_REQUEST'`.
- Characters that are not separators are kept: `'a+b'` becomes `'A+B'`.

---

## escapeRegex

Escapes regular expression special characters so a string matches itself literally inside `new RegExp()`. Uses the native `RegExp.escape()` when available, and otherwise a fallback that follows the same specification, so the output is identical in every browser.

```js
escapeRegex( string: string ): string
```

| Parameter | Type     | Default | Description              |
| --------- | -------- | ------- | ------------------------ |
| `string`  | `string` | —       | Text to match literally. |

**Returns:** `string`, the text with regex special characters escaped.

**Use case:** building patterns from search terms, prices, store separator settings or placeholder tokens, where characters like `.`, `$`, `(` or `{` must not act as regex syntax.

```js
new RegExp( escapeRegex( '$19.99' ) ).test( 'Total: $19.99' ); // true
new RegExp( escapeRegex( 'a.b' ) ).test( 'axb' ); // false
new RegExp( escapeRegex( 'wc-cart' ), 'u' ).test( 'wc-cart' ); // true
escapeRegex( 'a.b' ); // '\\x61\\.b'
```

```js
// Filter a product list as the shopper types, even for queries like "c++ (2nd ed.)".
$search.addEventListener( 'input', () => {
	const pattern = new RegExp( escapeRegex( $search.value.trim() ), 'i' );

	document.querySelectorAll( '.product' ).forEach( ( $product ) => {
		$product.hidden = ! pattern.test( $product.dataset.name );
	} );
} );
```

```js
// Parse a formatted price using store settings ("." thousands, "," decimals).
const number = '1.234,50 €'
	.replace( new RegExp( escapeRegex( '.' ), 'g' ), '' )
	.replace( ',', '.' )
	.replace( /[^\d.-]/g, '' );

parseFloat( number ); // 1234.5
```

**Notes:**

- Syntax characters (`^ $ \ . * + ? ( ) [ ] { } |` and `/`) get a backslash. A leading letter or digit, the punctuators ``, - = < > # & ! % : ; @ ~ ' ` "`` and whitespace are written as hex escapes (`-` → `\x2d`).
- The result is valid with every flag, including `u` and `v`, and inside character classes.
- The output is longer than the input, so compare match results rather than escaped strings in tests.
- Non-string input throws a `TypeError`.
- For a plain one-off replacement, `String.prototype.replaceAll( text, value )` needs no escaping.
