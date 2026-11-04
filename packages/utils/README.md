# @storepress/utils

JavaScript utilities for building DOM-based StorePress plugins for WordPress and WooCommerce. Write a plugin as a plain function; the plugin manager creates one instance per element, reads settings from `data-*` attributes, and handles `init`, `destroy` and `reload`. The package also includes helpers for DOM selection, events, objects and strings that work on their own.

[![npm version](https://img.shields.io/npm/v/@storepress/utils.svg)](https://www.npmjs.com/package/@storepress/utils)
[![License: GPL-2.0-or-later](https://img.shields.io/badge/License-GPL--2.0--or--later-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)

## Features

- **Plugin pattern:** write plugins as plain functions that return a public API. The manager tracks one instance per element.
- **Lifecycle control:** `setup`, `init`, `destroy`, `reload` and `clear`, for all elements or a selector.
- **Settings from markup:** read options from a JSON `data-*` attribute or one attribute per option, with numbers, booleans and regexes converted.
- **Event manager:** namespaced listeners you can list, trigger and remove together. They're removed automatically when the element leaves the page.
- **Global registry:** managers and instances are kept on `window.StorePress`, so other scripts and the browser console can find them.
- **Small helpers:** `deepMerge`, `findObjectValue`, `getElements`, swipe detection, case conversion and more. Each function is in its own file.
- **WordPress compatible:** follows WordPress coding standards and builds with `@wordpress/babel-preset-default`.

## Installation

```bash
npm install @storepress/utils --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

Import everything from the package root:

```js
import { createStorePressPlugin, deepMerge, getOptionsFromAttribute } from '@storepress/utils';
```

## Building a plugin

A StorePress plugin has three parts:

1. **The plugin** (`plugin.js`): a function that sets up one element and returns its public API.
2. **The plugin manager** (`index.js`): created with `createStorePressPlugin`. It finds the elements, creates one instance per element, and handles `init`, `destroy` and `reload`.
3. **The start script** (`script.js`): calls `init()` when the page is ready.

### 1. The plugin (`plugin.js`)

This is the recommended structure. Copy it as the starting point for a new plugin.

```js
'use strict';
/**
 * External dependencies
 */
import { deepMerge, getOptionsFromAttribute } from '@storepress/utils';

// Default settings for every instance.
const DEFAULTS = {
	x: 'XXX',
};

// Values the user must not override from options or attributes.
const PRIVATE = {};

const ATTRIBUTE = 'storepress-slider'; // data-storepress-slider

// Classes and CSS custom properties the plugin adds, so reset() can remove them.
const CSS_CLASSES = [ 'storepress-slider-top', 'storepress-slider-bottom' ];

const CSS_PROPERTIES = [ '--_slider-position' ];

function Plugin( element, options ) {
	// Later sources win: DEFAULTS < manager options < data-* attributes < PRIVATE.
	const settings = deepMerge(
		DEFAULTS,
		options,
		getOptionsFromAttribute( element, ATTRIBUTE ),
		PRIVATE
	);

	// One signal removes every listener this instance adds.
	const controller = new AbortController();

	const removeStyles = () => {
		CSS_PROPERTIES.forEach( ( property ) =>
			element.style.removeProperty( property )
		);
	};

	const removeClasses = () => {
		element.classList.remove( ...CSS_CLASSES );
	};

	const removeEvents = () => {
		controller.abort();
	};

	const calculatePosition = () => {
		removeStyles();
		removeClasses();

		// Read layout values when they are needed, not once at setup.
		const isRTL = getComputedStyle( element ).direction === 'rtl';
		// Calculate position.
	};

	const addEvents = () => {
		const { signal } = controller;
		element.addEventListener( 'pointerenter', calculatePosition, { signal } );
		element.addEventListener( 'focusin', calculatePosition, { signal } );
	};

	/**
	 * Resets the plugin: clears applied styles and classes and removes listeners.
	 * Called by the plugin manager on destroy, so the name must stay `reset`.
	 */
	const reset = () => {
		removeStyles();
		removeClasses();
		removeEvents();
	};

	addEvents();

	// Do not use `element` or `destroy` as keys: the manager sets them.
	return { reset, settings };
}

export { Plugin };
```

#### Plugin rules

- **Write a plain function and don't use `this`.** The manager calls `new Plugin( element, options )`, and the object you return becomes the instance. Anything set on `this` lands on a discarded object, and a plain call throws in strict mode. Keep state in local variables instead.
- **Return an object with `reset`.** The manager calls `reset` when the instance is destroyed. It tears the instance down for good: remove every class, style and listener the plugin added. `reload()` creates a new instance afterwards.
- **Don't return `element` or `destroy`.** The manager adds both keys to the returned object, and yours would be overwritten.
- **Return only the public API.** For example `{ reset, settings, next, prev }`. Everything else stays private in the closure.
- **Merge settings with `deepMerge`.** Spreading (`{ ...a, ...b }`) replaces nested objects such as those built by `data-storepress-slider--offset--top`. `deepMerge` merges them and returns a new object, so instances never share or change `DEFAULTS`.
- **Use one `AbortController` per instance.** Pass its `signal` to every `addEventListener` call, and call `controller.abort()` in `reset`.
- **Put constants at module level.** `DEFAULTS`, `ATTRIBUTE` and the class/property lists are the same for every element, so define them once outside the function.
- **List what you add.** Keep added classes and CSS properties in `CSS_CLASSES` and `CSS_PROPERTIES`, so `reset` always removes everything.
- **Support keyboard users.** Pair pointer events with focus events (`pointerenter` with `focusin`).

### 2. The plugin manager (`index.js`)

```js
'use strict';
/**
 * External dependencies
 */
import { createStorePressPlugin } from '@storepress/utils';

/**
 * Internal dependencies
 */
import { Plugin } from './plugin';

const StorePressSlider = createStorePressPlugin( {
	selector: '[data-storepress-slider]',
	plugin: Plugin,
	namespace: 'storepress-slider',
	options: {}, // Site-wide overrides; plugin defaults live in DEFAULTS.
} );

// Adds the init, destroy and reload event listeners.
StorePressSlider.setup();

// Optional hooks: `this` is the manager.
// createStorePressPlugin( { ..., callback: { onSetup() {}, onClear() {} } } );

export default StorePressSlider;
```

Importing this file runs `setup()`, which adds listeners on `document` and registers the manager on `window.StorePress`. Don't mark a plugin package with `"sideEffects": false`, or bundlers may drop the import.

### 3. The start script (`script.js`)

```js
'use strict';
/**
 * Internal dependencies
 */
import StorePressSlider from './index';

domReady(function () {
    StorePressSlider.init()
})
```

### Markup

Settings can come from a JSON attribute, from one attribute per option (`--` separates names), or both. Individual attributes override the JSON.

```html
<div data-storepress-slider='{"x": "YYY"}'>...</div>

<div data-storepress-slider data-storepress-slider--x="ZZZ">...</div>
```

### Manager methods

| Method | What it does |
| --- | --- |
| `setup()` | Adds the manager's `init`, `destroy` and `reload` event listeners. Call it once, then call `init()`. |
| `init( selector?, settings? )` | Creates an instance for each matching element. Elements that already have an instance are skipped. |
| `destroy( selector? )` | Calls each instance's `reset` and removes it. |
| `reload( selector?, settings? )` | `destroy()` followed by `init()`. |
| `clear( selector? )` | Destroys all instances and removes the manager's own listeners. Call `setup()` and `init()` to start again. |
| `get( selector? )` | Returns an array of instances for the matching elements that have one. |
| `controller` | The manager's `AbortController`. Pass `controller.signal` to your own document-level listeners so `clear()` removes them. |

`selector` defaults to the manager's `selector`. `settings` passed to `init()` or `reload()` replace the manager's `options` for those elements (they are not merged). The plugin's `DEFAULTS` still apply underneath, and `data-*` attributes still win over them.

```js
StorePressSlider.init(); // All [data-storepress-slider] elements.

// init() skips elements that already have an instance, so use reload()
// to rebuild one with new settings.
StorePressSlider.reload( '#hero', { x: 'Hero' } );

const [ instance ] = StorePressSlider.get( '#hero' );
instance.settings.x; // 'Hero', unless #hero sets x in a data-storepress-slider attribute

StorePressSlider.destroy(); // Remove all instances.
```

## Accessing plugins and instances

Other scripts can reach a plugin's manager and its instances by namespace, without importing the plugin's files.

```js
import { getPluginInstance, getStorePressPlugin } from '@storepress/utils';

// Instances for specific elements.
const [ slider ] = getPluginInstance( '#hero', 'storepress-slider' );

// The manager registered by createStorePressPlugin().
const StorePressSlider = getStorePressPlugin( 'storepress-slider' );

StorePressSlider.get(); // All instances for the manager's selector.
StorePressSlider.reload( '#hero' );

// Call what the plugin returned.
StorePressSlider.get().forEach( ( instance ) => instance.reset() );
```

Without a bundler, use the global registry. The key is the namespace converted with `toUpperCamelCase`, so `'storepress-slider'` becomes `StorepressSlider` (lowercase `p`):

```js
const StorePressSlider = window.StorePress.$Plugins.StorepressSlider.Plugin;
```

`getStorePressPlugin()` returns `{}` when no plugin is registered under that namespace, so check before calling methods. See the [store README](src/store/README.md) for the full `window.StorePress` layout.

## API overview

Each function lives in its own file under `src/`, grouped by topic. Every directory has a README with parameters, return values, notes and real-life examples.

| Directory | Description |
| --- | --- |
| [`dom/`](src/dom/README.md) | Resolve selectors and elements, and read plugin options from `data-*` attributes. |
| [`events/`](src/events/README.md) | Dispatch custom events, detect swipes, and manage listeners with grouped removal and cleanup. |
| [`object/`](src/object/README.md) | Check, merge and read nested objects, plus a `Map`-like store that doesn't keep elements alive. |
| [`plugin/`](src/plugin/README.md) | The plugin manager: run a plugin on elements through `init`, `destroy` and `reload`. |
| [`store/`](src/store/README.md) | Access the shared stores on `window.StorePress` that plugins and event managers use. |
| [`string/`](src/string/README.md) | Convert between naming cases and escape text for use in a regex. |
| [`testing/`](src/testing/README.md) | Simulate slow work in tests and Storybook stories. |

| Function | Description |
| --- | --- |
| [`getElement`](src/dom/README.md#getelement) | Resolves a selector or element to one `HTMLElement`, `document`, or `null`. |
| [`getElements`](src/dom/README.md#getelements) | Normalizes any target input into a new, static array of DOM targets. |
| [`getOptionsFromAttribute`](src/dom/README.md#getoptionsfromattribute) | Reads plugin options from an element's `data-*` attributes. |
| [`triggerEvent`](src/events/README.md#triggerevent) | Dispatches a `CustomEvent` with data on one or more targets. |
| [`swipeEvent`](src/events/README.md#swipeevent) | Detects swipe gestures on an element and reports distance and direction. |
| [`createEventManager`](src/events/README.md#createeventmanager) | Creates a namespaced listener manager with grouped removal and automatic cleanup. |
| [`isPlainObject`](src/object/README.md#isplainobject) | Checks whether a value is a plain key/value object. |
| [`deepMerge`](src/object/README.md#deepmerge) | Deeply merges plain objects into a new object; later sources win. |
| [`findObjectValue`](src/object/README.md#findobjectvalue) | Reads a nested value by a path string or an array of keys. |
| [`createWeakElementMap`](src/object/README.md#createweakelementmap) | A `Map`-like store keyed by elements that does not keep them alive. |
| [`createStorePressPlugin`](src/plugin/README.md#createstorepressplugin) | Creates a plugin manager and registers it on `window.StorePress`. |
| [`createPlugin`](src/plugin/README.md#createplugin) | Same as `createStorePressPlugin`, without the global registration. |
| [`createPluginInstance`](src/plugin/README.md#createplugininstance) | Creates one instance per element, or returns the existing one. |
| [`getPluginInstance`](src/plugin/README.md#getplugininstance) | Returns existing instances for elements, without creating any. |
| [`getPluginInstanceStore`](src/store/README.md#getplugininstancestore) | Returns the WeakMap of element → plugin instance for a namespace. |
| [`getStorePressPlugin`](src/store/README.md#getstorepressplugin) | Returns the plugin manager registered for a namespace, or `{}`. |
| [`getEventStore`](src/store/README.md#geteventstore) | Returns the Map that event managers use for one event prefix. |
| [`toCamelCase`](src/string/README.md#tocamelcase) | Converts a separated or capitalized string to `camelCase`. |
| [`toUpperCamelCase`](src/string/README.md#touppercamelcase) | Converts a string to `UpperCamelCase`, with a `StorePress` special case. |
| [`toKebabCase`](src/string/README.md#tokebabcase) | Converts a string to `kebab-case`. |
| [`toSnakeCase`](src/string/README.md#tosnakecase) | Converts a string to `snake_case`. |
| [`toConstantCase`](src/string/README.md#toconstantcase) | Converts a string to `CONSTANT_CASE`, collapsing repeated separators. |
| [`escapeRegex`](src/string/README.md#escaperegex) | Escapes regex special characters so text matches literally. |
| [`testWaitAsync`](src/testing/README.md#testwaitasync) | Returns a promise that resolves with `data` after a delay, without blocking. |
| [`testWaitSync`](src/testing/README.md#testwaitsync) | Blocks the main thread for a delay, then returns `data`. |

## Common tasks

Short examples of the helpers you'll use most. Follow the links for every option.

### Read settings from `data-*` attributes

[`getOptionsFromAttribute`](src/dom/README.md#getoptionsfromattribute) reads a JSON attribute and individual attributes (`--` creates nested options). Numbers, booleans (`true`/`false`, `yes`/`no`) and regexes are converted.

```html
<div id="slider"
	data-slider='{"autoplay": true, "speed": 500}'
	data-slider--animation--duration="800"
	data-slider--loop="yes"></div>
```

```js
getOptionsFromAttribute( '#slider', 'slider' );
// { autoplay: true, speed: 500, animation: { duration: 800 }, loop: true }
```

### Merge settings

[`deepMerge`](src/object/README.md#deepmerge) returns a new object. Nested objects are merged, arrays are replaced, and `undefined` values are skipped.

```js
deepMerge( { theme: { color: 'blue', size: 'm' }, tags: [ 'a' ] }, { theme: { color: 'red' }, tags: [ 'b' ] } );
// { theme: { color: 'red', size: 'm' }, tags: [ 'b' ] }
```

### Read a nested value

[`findObjectValue`](src/object/README.md#findobjectvalue) accepts `.`, `-` or `_` as separators, bracket indexes, or an array of keys.

```js
const cart = { totals: { total_price: '1999' }, items: [ { name: 'Hoodie' } ] };

findObjectValue( cart, 'items[0].name' );                // 'Hoodie'
findObjectValue( cart, 'totals.total_price', '0', '.' ); // '1999' ("." only, because the key has "_")
findObjectValue( cart, 'totals.tax', 0 );                // 0 (default)
```

### Manage listeners

[`createEventManager`](src/events/README.md#createeventmanager) groups listeners under a namespace. Native events (`click`, `keydown`) keep their names; custom events are named `storepress:{namespace}:{type}`.

```js
const events = createEventManager( 'mini-cart' );

events
	.add( '.mini-cart-toggle', 'click', toggle )
	.add( document, 'keydown', closeOnEscape )
	.add( '.mini-cart', 'updated', ( { detail } ) => render( detail.items ) );

// Dispatches "storepress:mini-cart:updated" with the data in event.detail.
events.trigger( '.mini-cart', 'updated', { items } );

events.remove( document, 'keydown' ); // One event type.
events.removeAll();                   // Everything in the namespace.
```

Methods: `add`, `set` (replace handlers for an event), `trigger`, `remove`, `removeAll`, `get` and `getAll` (inspect what is attached). Listeners on an element are removed automatically when the element is removed from the page; pass `{ autoRemove: false }` to turn that off.

Inside a plugin function, a single `AbortController` (as in the [plugin template](#1-the-plugin-pluginjs)) is usually enough. Use the event manager when you need custom events, want to inspect listeners, or share listeners between modules.

### Dispatch a custom event

[`triggerEvent`](src/events/README.md#triggerevent) dispatches a `CustomEvent`. It doesn't bubble unless you pass `{ bubbles: true }`.

```js
triggerEvent( document.body, 'storepress:cart:updated', { quantity: 3 } );

document.body.addEventListener( 'storepress:cart:updated', ( event ) => {
	updateCount( event.detail.quantity );
} );
```

### Detect swipes

[`swipeEvent`](src/events/README.md#swipeevent) handles touch, mouse and pen, and returns a cleanup function.

```js
const stop = swipeEvent( gallery, ( { detail } ) => {
	if ( detail.done ) {
		detail.left ? next() : previous();
	}
}, { offset: 40, touchOnly: true } );

stop(); // In the plugin's reset().
```

### Convert case

```js
toCamelCase( 'user-profile' );     // 'userProfile'
toUpperCamelCase( 'my-slider' );   // 'MySlider'
toKebabCase( 'firstName' );        // 'first-name'
toSnakeCase( 'UserProfile' );      // 'user_profile'
toConstantCase( 'database-url' );  // 'DATABASE_URL'
```

## Best practices

- **Clean up everything you add.** Every listener, class and CSS property a plugin adds should be removed in `reset()`. Use one `AbortController` per instance, or `events.removeAll()` with an event manager.
- **Use descriptive namespaces.** `'product-quick-view'`, not `'modal'`. The namespace names the global registry entry and the custom events, so it must be unique across plugins on the page.
- **Listen only while needed.** Add `keydown` or overlay `click` listeners when a modal opens and remove them when it closes, instead of checking an `isOpen` flag on every event.
- **Use passive listeners for scroll and touch.** `{ passive: true }` matters for `scroll`, `wheel`, `touchstart` and `touchmove`; it has no effect on other events.
- **Delegate when there are many children.** One `click` listener on a list with `event.target.closest( '.item' )` beats one listener per item, and keeps working for items added later.
- **Debug from the console.** `events.getAll()` lists every element and event in a namespace, and `window.StorePress.$Plugins` lists every registered plugin.

## Development

Source files, tests and docs follow the same layout: one function per file, grouped by topic.

```
packages/utils/
├── src/
│   ├── index.js                      # Re-exports every public function.
│   ├── README.md                     # Source overview and conventions.
│   └── dom/
│       ├── get-element.js            # Exports getElement.
│       └── README.md                 # Docs for every function in dom/.
└── tests/
    └── dom/
        └── get-element.test.js       # Tests for getElement.
```

When you add a function:

1. Create `src/<topic>/<function-name>.js`. The file name is the function name in kebab case.
2. Re-export it from `src/index.js` under its topic.
3. Document it in JSDoc and in `src/<topic>/README.md`, and add it to the tables in `src/README.md` and this file.
4. Add `tests/<topic>/<function-name>.test.js`. Import the function from its own file: `import { getElement } from '../../src/dom/get-element.js';`

Run the tests and the linter from the repository root:

```sh
npm test                                        # All tests.
npx wp-scripts test-unit-jest --config jest.config.cjs packages/utils/tests/dom   # One directory.
npm run test:coverage
npx eslint packages/utils/src
```

See [`src/README.md`](src/README.md) for the full conventions.

## Links

- [NPM Package](https://www.npmjs.com/package/@storepress/utils)
- [GitHub Repository](https://github.com/EmranAhmed/storepress-packages)
- [StorePress Slider](https://github.com/EmranAhmed/storepress-slider) (example implementation)
- [StorePress Tooltip](https://github.com/EmranAhmed/storepress-tooltip) (example implementation)
- [Storybook Documentation](https://emranahmed.github.io/storepress-packages/)
