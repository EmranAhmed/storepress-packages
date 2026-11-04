# Object utilities

Helpers for working with plain objects and element-keyed data: checking for option maps, merging layered settings, reading nested values by path, and storing per-element data without memory leaks.

```js
import {
	isPlainObject,
	deepMerge,
	findObjectValue,
	createWeakElementMap,
} from '@storepress/utils';
```

| Function | Description |
| --- | --- |
| [`isPlainObject`](#isplainobject) | Checks whether a value is a plain key/value object. |
| [`deepMerge`](#deepmerge) | Deeply merges plain objects into a new object; later sources win. |
| [`findObjectValue`](#findobjectvalue) | Reads a nested value by a path string or an array of keys. |
| [`createWeakElementMap`](#createweakelementmap) | A `Map`-like store keyed by elements that does not keep them alive. |

---

## isPlainObject

Checks whether a value is a plain object: one created by `{}`, `JSON.parse`, `new Object()` or `Object.create( null )`. Arrays, `null`, dates, regular expressions, maps, sets, DOM elements and class instances are rejected.

```js
isPlainObject( value ) => boolean
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `*` | — | Value to check. |

**Returns:** `boolean`. `true` when the prototype is `Object.prototype` or `null`.

**Use case:** Validate options parsed from JSON, a `data-*` attribute or an API response before reading their keys, or support an option that accepts either a shortcut (`true`) or a full settings object.

```js
isPlainObject( { a: 1 } );                  // true
isPlainObject( Object.create( null ) );     // true
isPlainObject( [ 1, 2 ] );                  // false
isPlainObject( new Date() );                // false
isPlainObject( document.body );             // false
isPlainObject( Object.create( { a: 1 } ) ); // false
```

```js
// <div class="product-gallery" data-gallery='{"thumbnails":"bottom"}'>
function readGalleryOptions( $gallery ) {
	try {
		const parsed = JSON.parse( $gallery.dataset.gallery || '{}' );
		// '[1,2]' and '"bottom"' are valid JSON but not option maps.
		return isPlainObject( parsed ) ? parsed : {};
	} catch {
		return {};
	}
}
```

```js
// `autoplay: true` and `autoplay: { delay: 3000 }` are both allowed.
function normalizeAutoplay( autoplay ) {
	if ( isPlainObject( autoplay ) ) {
		return { enabled: true, delay: 5000, ...autoplay };
	}
	return { enabled: Boolean( autoplay ), delay: 5000 };
}

normalizeAutoplay( true );            // { enabled: true, delay: 5000 }
normalizeAutoplay( { delay: 3000 } ); // { enabled: true, delay: 3000 }
```

**Notes:**

- Objects from another realm (an iframe) return `false`, because their prototype is a different `Object.prototype`.
- Only the prototype is checked; the object's values can be anything.

---

## deepMerge

Deeply merges plain objects into a new object. Later sources win. Nested plain objects are merged key by key, so each source only needs the keys it changes. Sources are never modified, and the result shares no plain objects or arrays with them.

```js
deepMerge( ...sources ) => Object
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `...sources` | `Object` | — | Objects to merge, in order of increasing priority. Values that are not plain objects are ignored. |

**Returns:** `Object`. A new merged object, or `{}` when no plain-object source is given.

| Value in a later source | Result |
| --- | --- |
| Plain object (and the earlier value is too) | Merged recursively |
| Plain object or array (otherwise) | Copied deeply, replaces the earlier value |
| `undefined` | Skipped; the earlier value is kept |
| `null` or a primitive | Replaces the earlier value |
| RegExp, Date, Map, Set, element, function, class instance | Replaces the earlier value, same reference |

**Use case:** Build final plugin settings from layers: defaults, then options passed from JavaScript, then options read from HTML `data-*` attributes.

```js
deepMerge( { speed: 300, nav: { arrows: true } }, { nav: { dots: true } } );
// { speed: 300, nav: { arrows: true, dots: true } }

deepMerge( { title: 'Hi', onOpen: open }, { title: null, onOpen: undefined } );
// { title: null, onOpen: open }

deepMerge( { sizes: [ 'S', 'M' ] }, { sizes: [ 'L' ] } ); // { sizes: [ 'L' ] }
deepMerge( undefined, { a: 1 }, [ 1, 2 ], { b: 2 } );     // { a: 1, b: 2 }
```

```js
// <div class="storepress-slider" data-storepress-slider='{"speed":500}'>
class Slider {
	static DEFAULTS = {
		autoplay: true,
		speed: 300,
		breakpoints: { 768: { perView: 2 }, 1024: { perView: 4 } },
	};

	constructor( $element, options = {} ) {
		this.options = deepMerge(
			Slider.DEFAULTS,
			options,
			getOptionsFromAttribute( $element, 'storepress-slider' )
		);
	}
}
```

```js
// Cart drawer settings: a theme overrides one label.
const settings = deepMerge(
	{
		ajax: { url: '/?wc-ajax=get_refreshed_fragments', timeout: 5000 },
		labels: { add: 'Add to cart', added: 'Added' },
	},
	{ labels: { added: 'In your cart' } },
	{ ajax: { timeout: undefined } }
);
// settings.labels => { add: 'Add to cart', added: 'In your cart' }
// settings.ajax.timeout => 5000
```

**Notes:**

- Use `null` to clear a value on purpose; `undefined` means "not set".
- Arrays are replaced, not concatenated. Append yourself: `{ sizes: [ ...defaults.sizes, ...extra.sizes ] }`.
- Non-plain objects (Map, Date, elements) are kept by reference, not cloned.
- `__proto__` keys are skipped, so untrusted JSON cannot replace a prototype.
- Circular references are preserved and point to the copy in the result.
- Only own enumerable string keys are copied; symbol keys are not.

---

## findObjectValue

Reads a nested value from an object using a path string (`'nav.arrows'`, `'nav-arrows'`, `'items[0].name'`) or an array of keys (`[ 'nav', 'arrows' ]`). By default `.`, `-` and `_` all separate keys.

```js
findObjectValue( obj, path, defaultValue, notation ) => *
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `obj` | `Object` | — | Object to read from. |
| `path` | `string \| number \| Array` | — | Path string, a number index, or an array of keys. An array is never split. |
| `defaultValue` | `*` | `undefined` | Returned when the value is `undefined`. |
| `notation` | `string \| string[]` | `[ '.', '-', '_' ]` | Separator character(s) used to split a string path. Replaces the defaults; `null` uses them. |

**Returns:** the value at the path, `defaultValue` when it is `undefined` or missing, or `undefined` when `path` has no keys.

**Use case:** Read localized script data, API responses or option keys from attribute-style names without long `?.` chains.

```js
const product = {
	price: { regular: 40, sale: null },
	stock: 0,
	variations: [ { sku: 'HD-S' }, { sku: 'HD-M' } ],
	meta: { color_code: '#333' },
};

findObjectValue( product, 'price.regular' );            // 40
findObjectValue( product, 'price-regular' );            // 40
findObjectValue( product, 'variations[1].sku' );        // 'HD-M'
findObjectValue( product, 'weight', 'n/a' );            // 'n/a'
findObjectValue( product, 'price.sale', 'n/a' );        // null
findObjectValue( product, 'meta.color_code', 'none' );  // 'none' (looks up meta.color.code)
findObjectValue( product, [ 'meta', 'color_code' ] );   // '#333'
findObjectValue( product, 'meta.color_code', '', '.' ); // '#333'
```

```js
// wp_localize_script() output: window.storepressCart = { i18n: { added: '...' } }
function cartText( key, fallback ) {
	return findObjectValue( window.storepressCart, `i18n.${ key }`, fallback );
}

cartText( 'added', 'Added to cart' );
```

```js
// WooCommerce Store API keys contain "_", so use "." as the only separator.
const cart = await ( await fetch( '/wp-json/wc/store/v1/cart' ) ).json();

const minorUnit = findObjectValue( cart, 'totals.currency_minor_unit', 2, '.' );
const total = findObjectValue( cart, 'totals.total_price', '0', '.' );
```

**Notes:**

- With the default notation, keys that contain `-` or `_` cannot be reached by a string path. Use an array path or pass `'.'` as `notation`.
- Only `undefined` falls back to `defaultValue`; `null` is returned as-is.
- A path with no keys returns `undefined`, even when a default is given: `''`, `[]`, `null`, or only separators such as `'...'`.
- A number is a single key: `findObjectValue( list, 1 )` reads `list[ 1 ]`.
- Only own properties are followed, so `'constructor'` or `'toString'` return `defaultValue`. Strings and arrays still expose `length` and indexes.
- Empty segments are skipped (`'a..b'` reads `a.b`). Quoted bracket keys like `"a['b']"` are not supported.
- Each separator is one character. An empty `notation` array means no splitting: the whole string is one key.
- Lookup stops at the first falsy value on the way and returns it: `{ stock: 0 }` with `'stock.count'` returns `0`, and `{ sale: null }` with `'sale.price'` returns `null`.

---

## createWeakElementMap

Creates a `Map`-like store keyed by DOM elements (or any objects) that does not keep its keys alive. Values live in a `WeakMap` and a `Set` of `WeakRef`s keeps the keys iterable, so you get `size`, `forEach` and `for...of` without leaking removed elements.

```js
createWeakElementMap() => {
	has, get, set, delete, clear, size, forEach, keys, values, entries, [Symbol.iterator]
}
```

This function takes no parameters.

**Returns:** a store with the same API as `Map`:

| Member | Description |
| --- | --- |
| `has( key )` | `true` if the key has a value. |
| `get( key )` | The value, or `undefined`. |
| `set( key, value )` | Stores a value and returns the store. Throws `TypeError` for primitive keys. |
| `delete( key )` | Removes a key; `true` if it existed. |
| `clear()` | Removes every key. |
| `size` | Number of live keys (O(n)). |
| `forEach( callback, thisArg )` | Calls `callback( value, key, store )` for every live entry. |
| `keys()`, `values()`, `entries()` | Iterators in insertion order. |
| `for...of`, spread, `Array.from` | Iterate `[ key, value ]` pairs. |

**Use case:** Plugin instance registries, per-element caches and listener stores on pages where elements are replaced by AJAX (cart fragments, filtered product grids, quick views). Removed elements can be garbage collected even if cleanup was forgotten.

```js
const store = createWeakElementMap();
const $button = document.querySelector( '#buy-now' );

store.set( $button, { clicks: 0 } );
store.get( $button ).clicks++; // 1
store.has( $button );          // true
store.size;                    // 1
store.delete( $button );       // true
store.set( 'buy-now', 1 );     // throws TypeError
```

```js
// Product gallery instances that survive AJAX filtering.
const galleries = createWeakElementMap();

function initGalleries( $root = document ) {
	$root.querySelectorAll( '.product-gallery' ).forEach( ( $gallery ) => {
		if ( ! galleries.has( $gallery ) ) {
			galleries.set( $gallery, new ProductGallery( $gallery ) );
		}
	} );
}

document.addEventListener( 'visibilitychange', () => {
	galleries.forEach( ( gallery ) =>
		document.hidden ? gallery.pause() : gallery.play()
	);
} );
```

```js
// Cache parsed variation JSON per form; it goes away with the form.
const variationCache = createWeakElementMap();

function getVariations( $form ) {
	if ( ! variationCache.has( $form ) ) {
		variationCache.set(
			$form,
			JSON.parse( $form.dataset.product_variations || '[]' )
		);
	}
	return variationCache.get( $form );
}
```

**Notes:**

- Keys must be objects. Use a plain `Map` for string keys.
- Don't reference the value from anything that lives longer than the element, or the element stays in memory.
- Garbage collection timing is up to the browser. A detached element can still be listed until it is collected; check `$element.isConnected` when that matters.
- Still call `delete` when you know an element is gone; the store is a safety net, not a replacement for cleanup.
- Requires `WeakRef`. In jsdom-based tests, `window` cannot be used as a key.
