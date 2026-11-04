# StorePress Utils source

Source code for `@storepress/utils`, the shared helpers that StorePress WooCommerce plugins use to find elements, read options from `data-*` attributes, manage events, and run plugins on the page.

Each function lives in its own file, grouped by topic. `index.js` only re-exports them, so you always import from the package root:

```js
import { getElements, createEventManager, deepMerge } from '@storepress/utils';
```

## Directories

| Directory                       | Name             | Description                                                                                     |
| ------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| [`dom/`](dom/README.md)         | DOM utilities    | Resolve selectors and elements, and read plugin options from `data-*` attributes.               |
| [`events/`](events/README.md)   | Event utilities  | Dispatch custom events, detect swipes, and manage listeners with grouped removal and cleanup.   |
| [`object/`](object/README.md)   | Object utilities | Check, merge and read nested objects, plus a `Map`-like store that doesn't keep elements alive. |
| [`plugin/`](plugin/README.md)   | Plugin system    | Run a plugin function on elements through `init`, `destroy` and `reload` events.                |
| [`store/`](store/README.md)     | Global stores    | Access the shared stores on `window.StorePress` that plugins and event managers use.            |
| [`string/`](string/README.md)   | String utilities | Convert between naming cases and escape text for use in a regex.                                |
| [`testing/`](testing/README.md) | Testing helpers  | Simulate slow work in tests and Storybook stories.                                              |

## All functions

| Function                                                            | Directory | Description                                                                       |
| ------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| [`getElement`](dom/README.md#getelement)                            | `dom`     | Resolves a selector or element to one `HTMLElement`, `document`, or `null`.       |
| [`getElements`](dom/README.md#getelements)                          | `dom`     | Normalizes any target input into a new, static array of DOM targets.              |
| [`getOptionsFromAttribute`](dom/README.md#getoptionsfromattribute)  | `dom`     | Reads plugin options from an element's `data-*` attributes.                       |
| [`triggerEvent`](events/README.md#triggerevent)                     | `events`  | Dispatches a `CustomEvent` with data on one or more targets.                      |
| [`swipeEvent`](events/README.md#swipeevent)                         | `events`  | Detects swipe gestures on an element and reports distance and direction.          |
| [`createEventManager`](events/README.md#createeventmanager)         | `events`  | Creates a namespaced listener manager with grouped removal and automatic cleanup. |
| [`isPlainObject`](object/README.md#isplainobject)                   | `object`  | Checks whether a value is a plain key/value object.                               |
| [`deepMerge`](object/README.md#deepmerge)                           | `object`  | Deeply merges plain objects into a new object; later sources win.                 |
| [`findObjectValue`](object/README.md#findobjectvalue)               | `object`  | Reads a nested value by a path string or an array of keys.                        |
| [`createWeakElementMap`](object/README.md#createweakelementmap)     | `object`  | A `Map`-like store keyed by elements that does not keep them alive.               |
| [`createPlugin`](plugin/README.md#createplugin)                     | `plugin`  | Creates a plugin manager that runs a plugin function on elements.                |
| [`createStorePressPlugin`](plugin/README.md#createstorepressplugin) | `plugin`  | Same as `createPlugin`, and also registers the controller on `window.StorePress`. |
| [`createPluginInstance`](plugin/README.md#createplugininstance)     | `plugin`  | Creates one instance per element, or returns the existing one.                    |
| [`getPluginInstance`](plugin/README.md#getplugininstance)           | `plugin`  | Returns existing instances for elements, without creating any.                    |
| [`getPluginInstanceStore`](store/README.md#getplugininstancestore)  | `store`   | Returns the WeakMap of element → plugin instance for a namespace.                 |
| [`getStorePressPlugin`](store/README.md#getstorepressplugin)        | `store`   | Returns the plugin controller registered for a namespace, or `{}`.                |
| [`getEventStore`](store/README.md#geteventstore)                    | `store`   | Returns the Map that event managers use for one event prefix.                     |
| [`toCamelCase`](string/README.md#tocamelcase)                       | `string`  | Converts a separated or capitalized string to `camelCase`.                        |
| [`toUpperCamelCase`](string/README.md#touppercamelcase)             | `string`  | Converts a string to `UpperCamelCase`, with a `StorePress` special case.          |
| [`toKebabCase`](string/README.md#tokebabcase)                       | `string`  | Converts a string to `kebab-case`.                                                |
| [`toSnakeCase`](string/README.md#tosnakecase)                       | `string`  | Converts a string to `snake_case`.                                                |
| [`toConstantCase`](string/README.md#toconstantcase)                 | `string`  | Converts a string to `CONSTANT_CASE`, collapsing repeated separators.             |
| [`escapeRegex`](string/README.md#escaperegex)                       | `string`  | Escapes regex special characters so text matches literally.                       |
| [`testWaitAsync`](testing/README.md#testwaitasync)                  | `testing` | Returns a promise that resolves with `data` after a delay, without blocking.      |
| [`testWaitSync`](testing/README.md#testwaitsync)                    | `testing` | Blocks the main thread for a delay, then returns `data`.                          |

## How the pieces fit together

A typical StorePress plugin uses most directories at once:

1. **`plugin/`**: `createStorePressPlugin()` registers a plugin manager for a plugin function, such as a product slider.
2. **`dom/`**: the manager finds target elements with `getElements()`, and each instance reads its settings with `getOptionsFromAttribute()`.
3. **`object/`**: `deepMerge()` combines default options with the `data-*` options.
4. **`events/`**: the plugin adds listeners with one `AbortController`, or with `createEventManager()` when it needs custom events. Either way they are removed together in `reset()`.
5. **`store/`**: instances and listeners are kept on `window.StorePress`, so other plugins and the browser console can find them.

```js
import {
	createStorePressPlugin,
	getOptionsFromAttribute,
	deepMerge,
} from '@storepress/utils';

const DEFAULTS = { autoplay: false, speed: 300 };

function ProductSlider( element, options ) {
	const settings = deepMerge(
		DEFAULTS,
		options,
		getOptionsFromAttribute( element, 'slider' ) // <div data-slider='{"autoplay":true}'>
	);
	const controller = new AbortController();

	const next = () => {
		// Show the next slide.
	};

	element.querySelectorAll( '.next' ).forEach( ( $button ) =>
		$button.addEventListener( 'click', next, { signal: controller.signal } )
	);

	// The manager calls reset() on destroy.
	const reset = () => controller.abort();

	return { reset, next, settings };
}

const slider = createStorePressPlugin( {
	selector: '.product-slider',
	options: {},
	plugin: ProductSlider,
	namespace: 'product-slider',
} );

slider.setup();
slider.init();
```

See the [plugin system README](plugin/README.md) for the full lifecycle and the exact options `createStorePressPlugin` accepts, and the [package README](../README.md#building-a-plugin) for the recommended plugin template.

## Conventions

- **One function per file.** The file name is the function name in kebab case, for example `get-elements.js` exports `getElements`.
- **Export from `index.js`.** Add a re-export for every new public function, grouped under its topic.
- **JSDoc:** exported functions have a summary, notes, typed `@param`/`@return`/`@throws` tags and 4-5 `@example` blocks (one "at a glance" block, then real-life use cases). Internal helpers and methods on returned objects have 2 examples.
- **README per directory:** when you add or change a function, update its directory README and the tables above.
- **Code style:** WordPress coding standards (`fn( arg )` spacing, tabs). Run `npx eslint packages/utils/src` before committing.
- **One test file per function.** Tests mirror the source layout: `src/dom/get-element.js` is tested in `tests/dom/get-element.test.js`. Import the function from its own file, not from `index.js`:

    ```js
    import { getElement } from '../../src/dom/get-element.js';
    ```

    Run them from the repository root:

    ```sh
    npm test                                                                         # All tests.
    npx wp-scripts test-unit-jest --config jest.config.cjs packages/utils/tests/dom  # One directory.
    ```

## Known issues

Some functions have documented limitations, such as `getElement` rejecting SVG elements and `window`, `findObjectValue` returning falsy values found partway along a path, and `createPluginInstance` overwriting `element` and `destroy` keys returned by a plugin. Each one is described in the **Notes** of the function's JSDoc and in its directory README.
