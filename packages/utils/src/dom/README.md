# DOM utilities

Helpers for finding elements and reading their configuration. Plugins use them to accept a target in any form (selector, element, list) and to read settings that PHP prints into `data-*` attributes.

```js
import { getElement, getElements, getOptionsFromAttribute } from '@storepress/utils';
```

| Function                                              | Description                                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| [`getElement`](#getelement)                           | Resolves a selector or element to one `HTMLElement`, `document`, or `null`. |
| [`getElements`](#getelements)                         | Normalizes any target input into a new, static array of DOM targets.        |
| [`getOptionsFromAttribute`](#getoptionsfromattribute) | Reads plugin options from an element's `data-*` attributes.                 |

---

## getElement

Resolves a CSS selector or an element to a single `HTMLElement`, `document`, or `null`. Use it when exactly one target is expected, such as a modal, a mini-cart or a checkout form. Use [`getElements`](#getelements) when the target can match several elements.

```js
getElement( selector = null ): HTMLElement | Document | null
```

| Parameter  | Type                                   | Default | Description                                     |
| ---------- | -------------------------------------- | ------- | ----------------------------------------------- |
| `selector` | `string \| HTMLElement \| Document \| null` | `null`  | A CSS selector, an element, or `document`. |

**Returns:** the first matching element, the same element, `document`, or `null` when nothing matches or the input is not supported.

**Throws:** `SyntaxError` when `selector` is an empty, blank or invalid CSS selector string.

| Input                                             | Result                                            |
| ------------------------------------------------- | ------------------------------------------------- |
| CSS selector string                               | `document.querySelector()`: first match or `null` |
| `HTMLElement` (including `<form>`, `<select>`)    | The same element                                  |
| `document`                                        | `document`                                        |
| `null` or `undefined`                             | `null`                                            |
| SVG element, element from another frame           | `null`                                            |
| `window`, NodeList, array, number, object         | `null`                                            |
| Empty, blank or invalid selector (`''`, `'div['`) | Throws `SyntaxError`                              |

**Use case:** a component constructor that lets callers pass either `'#site-header-cart'` or an element they already have, and only has to handle one element or `null`.

**Examples:**

```js
getElement( '#add-to-cart' );      // <button id="add-to-cart">
getElement( '.missing' );          // null
getElement( $button ) === $button; // true
getElement( document );            // document
getElement( null );                // null
getElement( '' );                  // throws SyntaxError
```

```js
// A mini-cart that accepts a selector or an element.
class MiniCart {
  constructor( target, options = {} ) {
    this.$element = getElement( target );

    if ( ! this.$element ) {
      throw new Error( 'MiniCart: target element not found.' );
    }

    this.options = options;
  }
}

new MiniCart( '#site-header-cart' );
new MiniCart( document.querySelector( '.widget_shopping_cart' ) );
```

```js
// Guarding a selector that comes from plugin settings.
function findSafe( selector ) {
  if ( typeof selector === 'string' && ! selector.trim() ) {
    return null;
  }

  try {
    return getElement( selector );
  } catch {
    console.warn( `Invalid selector: ${ selector }` );
    return null;
  }
}
```

**Notes:**

- Empty, blank or invalid selectors throw. `getElements` returns `[]` for the same input.
- Elements are checked with `instanceof HTMLElement`, so SVG elements and elements from another frame return `null`. `getElements` accepts them.
- Selectors are always queried against `document`. To search inside a container, pass `container.querySelector( '...' )`.

---

## getElements

Normalizes any target input into a new, static array: a CSS selector, a single element, a NodeList, an array, `document` or `window`. Callers can always use `forEach`, `map` and `filter` without checking the input type.

```js
getElements( selectors = [] ): Array<Element | Document | Window>
```

| Parameter   | Type                                                        | Default | Description                                         |
| ----------- | ----------------------------------------------------------- | ------- | --------------------------------------------------- |
| `selectors` | `string \| Element \| Document \| Window \| ArrayLike<Element> \| null` | `[]`    | A CSS selector, a single target, or a list of targets. |

**Returns:** a new array of resolved targets; empty when nothing matches.

| Input                                  | Result                                        |
| -------------------------------------- | --------------------------------------------- |
| CSS selector string                    | `Array.from( document.querySelectorAll() )`   |
| Element (HTML, SVG, or from an iframe) | `[ element ]`                                 |
| `document` or `window`                 | `[ document ]` / `[ window ]`                 |
| Array, NodeList, HTMLCollection        | New array; `null`/`undefined` entries removed |
| `undefined`, `null`, `''`, `'   '`     | `[]`                                          |
| Invalid selector (e.g. `'div['`)       | `[]` (the `SyntaxError` is swallowed)         |
| Anything else (number, plain object)   | `[]`                                          |

**Use case:** an event helper or plugin initializer that should work the same for one button, a selector, a NodeList from an AJAX response, or `window`.

**Examples:**

```js
getElements( '.card' );                           // [ div.card, div.card, ... ]
getElements( document.querySelector( 'svg' ) );   // [ svg ]
getElements( document.forms[ 0 ] );               // [ form ] (not its controls)
getElements( document.querySelectorAll( 'li' ) ); // [ li, li, ... ] as an Array
getElements( [ header, null, footer ] );          // [ header, footer ]
getElements( window );                            // [ window ]
getElements( 'div[' );                            // []
```

```js
// An event helper that accepts any target and returns a cleanup function.
function bindAll( targets, type, handler, options ) {
  const elements = getElements( targets );

  elements.forEach( ( element ) => element.addEventListener( type, handler, options ) );

  return () => {
    elements.forEach( ( element ) => element.removeEventListener( type, handler, options ) );
  };
}

const unbindClicks = bindAll( '.add-to-cart', 'click', onAddToCart );
const unbindResize = bindAll( window, 'resize', onResize, { passive: true } );
```

```js
// Initializing a product gallery on every match, skipping ones already set up.
const instances = new WeakMap();

function initGallery( targets, options = {} ) {
  return getElements( targets )
    .filter( ( element ) => ! instances.has( element ) )
    .map( ( element ) => {
      const gallery = new Gallery( element, options );
      instances.set( element, gallery ); // WeakMap: no leak when the element is removed
      return gallery;
    } );
}

initGallery( '.product-gallery' );
initGallery( ajaxResponseContainer.querySelectorAll( '.product-gallery' ) );
```

**Notes:**

- The result is always a new array. Changing it never affects the input, and later DOM changes never affect it.
- Invalid selectors return `[]` instead of throwing, so a typo fails silently.
- Selectors are always queried against `document`.
- The result holds strong references to the elements. Release it when the elements are removed if you keep it in a long-lived object.

---

## getOptionsFromAttribute

Reads a plugin's configuration options from an element's `data-*` attributes. Two sources are combined, and overrides win:

1. **Main attribute** `data-{name}`: an object written as JSON (`{"speed": 300}`) or as relaxed single-quoted notation (`{'speed': 300}`).
2. **Override attributes** `data-{name}--{key}`: one attribute per option. Each `--` starts a nested level, and single hyphens become camelCase: `data-slider--speed-limit` sets `speedLimit`, and `data-slider--animation--duration` sets `animation.duration`.

```js
getOptionsFromAttribute( element, dataAttributeName, userFeatures = {} ): Object
```

| Parameter                         | Type                | Default             | Description                                                                                    |
| --------------------------------- | ------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| `element`                         | `string \| Element` | -                   | Element (HTML or SVG), or a CSS selector for one.                                              |
| `dataAttributeName`               | `string`            | -                   | Attribute name without `data-`, e.g. `'storepress-slider'` or `'storepressSlider'`.            |
| `userFeatures`                    | `Object`            | `{}`                | Parsing options (below).                                                                       |
| `userFeatures.parseNumber`        | `boolean`           | `true`              | Convert numeric strings to numbers.                                                            |
| `userFeatures.parseBoolean`       | `boolean`           | `true`              | Convert `truthyStrings` and `falsyStrings` to booleans.                                        |
| `userFeatures.truthyStrings`      | `string[]`          | `['yes', 'true']`   | Strings converted to `true` (case-insensitive).                                                |
| `userFeatures.falsyStrings`       | `string[]`          | `['no', 'false']`   | Strings converted to `false` (case-insensitive).                                               |
| `userFeatures.parseRegex`         | `boolean`           | `true`              | Convert `"/pattern/flags"` strings to RegExp, in overrides and in JSON.                        |
| `userFeatures.parseJSON`          | `boolean`           | `true`              | Parse override values that start with `[` or `{` as JSON.                                      |
| `userFeatures.emptyValue`         | `*`                 | `true`              | Value for override attributes with no value, e.g. `data-x--autoplay`.                          |
| `userFeatures.convertJSONStrings` | `boolean \| 'auto'` | `'auto'`            | Convert strings in the main attribute: `'auto'` (relaxed notation only), `true` or `false`.    |

**Returns:** a new plain object of options; `{}` when the element or attributes are missing.

**Throws:** `SyntaxError` when `element` is an empty or invalid CSS selector.

| Value                                     | Override attribute    | Main attribute: strict JSON | Main attribute: relaxed |
| ----------------------------------------- | --------------------- | --------------------------- | ----------------------- |
| No value (`data-x--autoplay`)             | `true` (`emptyValue`) | -                           | -                       |
| `"yes"`, `"true"` / `"no"`, `"false"`     | `true` / `false`      | Kept as string              | `true` / `false`        |
| `"42"`, `"-3.14"`                         | Number                | Kept as string              | Number                  |
| `"01234"`, `"0x10"`, `"1e3"`, unsafe ints | String                | String                      | String                  |
| `"/^a/i"`, `"/\d+/"`                      | RegExp                | RegExp                      | RegExp                  |
| `"/shop/"` (no flags, no metacharacters)  | String                | String                      | String                  |
| `'["a","b"]'`, `'{"w": 1}'`               | Array / object        | Native JSON value           | Native value            |
| Anything else                             | String (untrimmed)    | String                      | String                  |

**Use case:** PHP prints a product gallery's settings with `wp_json_encode()`, a theme template turns one option off for a single product, and the JavaScript plugin merges both on top of its defaults, with no extra JavaScript per page.

**Examples:**

```js
// <div class="box"
//      data-box='{"speed": 300}'
//      data-box--enabled="yes"
//      data-box--speed-limit="1000"
//      data-box--autoplay
//      data-box--zip="01234"
//      data-box--pattern="/^test$/i"></div>
getOptionsFromAttribute( '.box', 'box' );
// { speed: 300, enabled: true, speedLimit: 1000, autoplay: true, zip: '01234', pattern: /^test$/i }

getOptionsFromAttribute( '.missing', 'box' ); // {}
```

```js
// Plugin defaults + server settings + a per-product override.
// <div class="storepress-gallery"
//      data-storepress-gallery="<?php echo esc_attr( wp_json_encode( $settings ) ); ?>"
//      data-storepress-gallery--zoom="false"></div>
// $settings = [ 'thumbnails' => 'bottom', 'zoom' => true, 'slidesPerView' => 4 ];
const DEFAULTS = { thumbnails: 'left', zoom: true, slidesPerView: 3, loop: false };

class ProductGallery {
  constructor( $element, options = {} ) {
    this.options = {
      ...DEFAULTS,
      ...options,
      ...getOptionsFromAttribute( $element, 'storepress-gallery' ), // HTML wins
    };
  }
}

// { thumbnails: 'bottom', zoom: false, slidesPerView: 4, loop: false }
```

```js
// Nested options from a page builder, plus strict vs relaxed main attributes.
// <aside class="cart-drawer"
//        data-cart-drawer='{"position": "right", "animation": {"easing": "linear", "duration": 200}}'
//        data-cart-drawer--animation--duration="350"
//        data-cart-drawer--overlay--close-on-click="true"></aside>
getOptionsFromAttribute( '.cart-drawer', 'cart-drawer' );
// { position: 'right', animation: { easing: 'linear', duration: 350 }, overlay: { closeOnClick: true } }

// <div class="product" data-product='{"sku": "00123", "featured": "yes", "stock": "12"}'></div>
getOptionsFromAttribute( '.product', 'product' );
// { sku: '00123', featured: 'yes', stock: '12' } (strict JSON keeps its strings)

// <ul class="variation-swatches" data-swatches="{'tooltip': 'true', 'limit': '5'}"></ul>
getOptionsFromAttribute( '.variation-swatches', 'swatches' );
// { tooltip: true, limit: 5 } (relaxed notation is converted)
```

**Notes:**

- Strict JSON keeps its string types (only regex strings convert); relaxed notation is converted like override attributes. Set `convertJSONStrings` to `true` or `false` to change this.
- Keep SKUs, zip codes, long IDs and version strings in strict JSON, or set `parseNumber: false`.
- HTML lowercases attribute names: write `data-x--speed-limit` for `speedLimit`, never `data-x--speedLimit`.
- A leading `data-` in `dataAttributeName` is removed only in kebab form: `'dataSlider'` reads `data-data-slider`.
- Invalid JSON never throws: a warning is logged and that source is ignored. A main attribute that is not an object is ignored too.
- A parent override with a value plus child overrides (`data-x--nav="5"` and `data-x--nav--next="a"`) conflict: the children win and a warning is logged.
- `__proto__` keys are dropped.
- Attributes are read once per call; nothing is cached or observed.
