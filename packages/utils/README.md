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
import domReady from '@wordpress/dom-ready';

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

## Plugin with an event manager

The template above uses one `AbortController` per instance, which is enough for most plugins. When a plugin needs namespaced custom events, listener inspection or automatic removal, build it on [`createEventManager`](src/events/README.md#createeventmanager) instead.

### When to use which

| Need | `AbortController` | `createEventManager` | Real-life example |
| --- | --- | --- | --- |
| Remove all of one instance's listeners | `controller.abort()`, simplest | `events.removeAll( element )`, plus `events.remove()` for shared targets such as `document` | Any plugin's `reset()` |
| Custom events other scripts can listen to | Write the full name by hand | Named `storepress:{namespace}:{type}` | A slider announces `slide-change` so a thumbnail strip or analytics script can follow it |
| See what is attached while debugging | Not possible | `events.getAll()` or `events.getAll( element )` in the console | Finding why a quick view button fires twice after AJAX |
| Listeners removed when the element leaves the page | No (only garbage collected) | Yes, on by default (`autoRemove`) | Mini-cart markup replaced by WooCommerce cart fragments |
| Swap one handler or remove one event type | Manual bookkeeping | `events.set()` / `events.remove( target, type )` | A modal adds `keydown` and overlay `click` on open and removes them on close |
| Few listeners, no custom events | Best choice | More than you need | Tooltip, read-more toggle, quantity stepper |

### Rules

1. **Create one event manager per plugin, outside the plugin function.** All instances share it. Export it so tests and the console can inspect it.
2. **In `reset()`, pass the element: `events.removeAll( element )`.** Without a target, `removeAll()` removes every instance's listeners, because managers with the same namespace share one store. `removeAll( element )` removes only the listeners on that element.
3. **Remove shared targets by handler.** `document` and `window` are shared by every instance, so never call `removeAll( document )`. Use `events.remove( document, 'keydown', handleKeydown )`, which removes only this instance's handler.
4. **Delegate events from the element.** `removeAll( element )` does not touch listeners on child elements. Add one listener to the element and use `event.target.closest( '.next' )`, so a single call removes them all and buttons added later still work.
5. **Don't reuse the plugin manager's namespace.** `createStorePressPlugin( { namespace: 'slider' } )` keeps its `init`, `destroy` and `reload` listeners under `storepress` / `slider`. Calling `createEventManager( 'slider' )` in the plugin puts both in the same store, and a `removeAll()` stops `init()` from working. Use a separate name such as `'slider-ui'`.
6. **Announce events with `triggerEvent()`.** `events.trigger()` dispatches only events this event manager registered on that element. An event the plugin only announces, and never listens for itself, is not registered, so `trigger()` sends nothing.
7. **Avoid custom names that match native events.** A type with an `on…` property on the element (`change`, `select`, `input`) is attached as the native event. Use `slide-change`, not `change`.

### Template

```js
'use strict';
/**
 * External dependencies
 */
import {
	createEventManager,
	deepMerge,
	getOptionsFromAttribute,
	triggerEvent,
} from '@storepress/utils';

// Default settings for every instance.
const DEFAULTS = {
	loop: true,
	start: 0,
};

// Values the user must not override from options or attributes.
const PRIVATE = {};

const ATTRIBUTE = 'storepress-slider'; // data-storepress-slider

// Must differ from the plugin manager's namespace ('storepress-slider').
const EVENT_NAMESPACE = 'slider-ui';

// Class the plugin adds, so reset() can remove it.
const ACTIVE_CLASS = 'is-active';

// One event manager for all instances. Exported for tests and debugging.
export const events = createEventManager( EVENT_NAMESPACE );

function Plugin( element, options ) {
	// Later sources win: DEFAULTS < manager options < data-* attributes < PRIVATE.
	const settings = deepMerge(
		DEFAULTS,
		options,
		getOptionsFromAttribute( element, ATTRIBUTE ),
		PRIVATE
	);

	let index = 0;

	// Query when needed, so slides added later are included.
	const getSlides = () => element.querySelectorAll( '.slide' );

	const removeClasses = () => {
		getSlides().forEach( ( $slide ) =>
			$slide.classList.remove( ACTIVE_CLASS )
		);
	};

	const render = () => {
		removeClasses();
		getSlides()[ index ]?.classList.add( ACTIVE_CLASS );
	};

	const goTo = ( newIndex ) => {
		const last = getSlides().length - 1;
		if ( settings.loop ) {
			index = newIndex > last ? 0 : newIndex < 0 ? last : newIndex;
		} else {
			index = Math.min( Math.max( newIndex, 0 ), last );
		}
		render();

		// Tell other scripts. Listen with:
		// document.addEventListener( 'storepress:slider-ui:slide-change', ... )
		//
		// Not events.trigger(): it uses triggerEvent() internally, but only
		// for events this event manager registered on `element`. Nothing here
		// adds 'slide-change', so it would dispatch nothing. triggerEvent()
		// always dispatches, and `bubbles: true` lets listeners on document
		// hear it.
		triggerEvent(
			element,
			events.getEventName( 'slide-change' ), // 'storepress:slider-ui:slide-change'
			{ index },
			{ bubbles: true }
		);
	};

	const next = () => goTo( index + 1 );
	const prev = () => goTo( index - 1 );
	const getIndex = () => index;

	// One delegated listener on the slider handles every button inside it.
	const handleClick = ( event ) => {
		const $button = event.target.closest( '.prev, .next' );
		if ( ! $button || ! element.contains( $button ) ) {
			return;
		}
		if ( $button.matches( '.next' ) ) {
			next();
		} else {
			prev();
		}
	};

	// Lets other scripts move the slider:
	// triggerEvent( slider, 'storepress:slider-ui:go-to', { index: 2 } )
	const handleGoTo = ( { detail } ) => goTo( detail.index );

	const handleKeydown = ( event ) => {
		// The markup was replaced without destroy(): clean up and stop.
		if ( ! element.isConnected ) {
			reset();
			return;
		}
		if ( ! element.contains( document.activeElement ) ) {
			return;
		}
		if ( event.key === 'ArrowRight' ) {
			next();
		}
		if ( event.key === 'ArrowLeft' ) {
			prev();
		}
	};

	const addEvents = () => {
		events.add( element, 'click', handleClick );
		events.add( element, 'go-to', handleGoTo ); // 'storepress:slider-ui:go-to'
		events.add( document, 'keydown', handleKeydown );
	};

	const removeEvents = () => {
		// Every listener on this slider element.
		events.removeAll( element );
		// Shared target: remove only this instance's handler.
		events.remove( document, 'keydown', handleKeydown );
	};

	/**
	 * Resets the plugin: clears applied classes and removes listeners.
	 * Called by the plugin manager on destroy, so the name must stay `reset`.
	 */
	const reset = () => {
		removeClasses();
		removeEvents();
	};

	addEvents();
	index = settings.start;
	render();

	// Do not use `element` or `destroy` as keys: the manager sets them.
	return { reset, next, prev, goTo, getIndex, settings };
}

export { Plugin };
```

The manager (`index.js`) and start script (`script.js`) are the same as for the `AbortController` template.

Other scripts can follow and move the slider without importing it:

```js
document.addEventListener( 'storepress:slider-ui:slide-change', ( event ) => {
	// event.target is the slider element.
	highlightThumbnail( event.target, event.detail.index );
} );

triggerEvent( document.querySelector( '#hero' ), 'storepress:slider-ui:go-to', { index: 2 } );
```

While debugging, list what one slider has attached:

```js
events.getAll( '#hero' );
// [ { $element: div#hero, $events: [
//   { eventType: 'storepress:slider-ui:click', isNative: true, nativeType: 'click', size: 1 },
//   { eventType: 'storepress:slider-ui:go-to', isNative: false, nativeType: '', size: 1 },
// ] } ]
```

## Updating markup with AJAX

Instances belong to elements. When AJAX changes the markup, tell the plugin manager what happened. The same steps work for both plugin templates.

### Markup is replaced (filters, pagination, quick view)

Destroy the instances inside the markup you are about to replace, replace it, then init the new markup. Destroying first runs each instance's `reset()`, so listeners on `document` and `window` are removed too.

```js
/**
 * Internal dependencies
 */
import StorePressSlider from './index';

const RESULTS = '.products';
const SLIDERS = `${ RESULTS } [data-storepress-slider]`;

async function loadProducts( url ) {
	const response = await fetch( url );
	const $page = new DOMParser().parseFromString( await response.text(), 'text/html' );

	// 1. Reset and forget the instances in the old markup.
	StorePressSlider.destroy( SLIDERS );

	// 2. Replace the markup.
	document.querySelector( RESULTS ).replaceWith( $page.querySelector( RESULTS ) );

	// 3. Create instances for the new markup.
	StorePressSlider.init( SLIDERS );
}

document.querySelector( '.product-filters' ).addEventListener( 'change', ( event ) => {
	const url = new URL( window.location.href );
	url.searchParams.set( event.target.name, event.target.value );
	loadProducts( url );
} );
```

Destroy after the response arrives, not before the request, so the old sliders keep working while the page loads.

### Markup is added (load more, infinite scroll)

Only call `init()`. Elements that already have an instance are skipped, so existing sliders keep their state.

```js
document.querySelector( '.load-more' ).addEventListener( 'click', async ( event ) => {
	const response = await fetch( event.currentTarget.dataset.nextPage );
	document.querySelector( '.products' ).insertAdjacentHTML( 'beforeend', await response.text() );

	StorePressSlider.init();
} );
```

### Markup is replaced by code you don't control (WooCommerce fragments)

WooCommerce replaces cart fragments and the cart table without warning, so you can't call `destroy()` first. Call `init()` afterwards for the new markup:

```js
jQuery( document.body ).on( 'wc_fragments_refreshed wc_fragments_loaded updated_wc_div', () => {
	StorePressSlider.init();
} );
```

The old instances are cleaned up without `reset()`:

- **Listeners on the removed elements:** the event manager removes them automatically (`autoRemove`). With the `AbortController` template, they are garbage collected with the elements.
- **The instance itself:** the instance store is a `WeakMap`, so it is released with its element.
- **Listeners on `document` or `window`:** these are not removed automatically. Check `element.isConnected` in those handlers and call `reset()` when it is `false`, as `handleKeydown` does in the template above.

## Testing a plugin

Test a plugin through its manager, the way a page uses it: write the markup, call `init()`, act like a user, and check the DOM, the instance and the listeners. Tests run in Jest with jsdom.

### Setup

```sh
npm install --save-dev jest jest-environment-jsdom babel-jest @wordpress/babel-preset-default
```

```js
// jest.config.js
module.exports = {
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.js$': [ 'babel-jest', { presets: [ '@wordpress/babel-preset-default' ] } ],
	},
};
```

Add `"test": "jest"` to the `scripts` in `package.json`, then put tests next to the source:

```
my-slider/
├── src/
│   ├── plugin.js        # The plugin (template above).
│   ├── index.js         # The plugin manager.
│   └── script.js        # The start script.
└── tests/
    └── plugin.test.js
```

### Test

This test covers the [event manager template](#template): setup, settings, user actions, custom events and cleanup.

```js
/**
 * External dependencies
 */
import { triggerEvent } from '@storepress/utils';

/**
 * Internal dependencies
 */
import StorePressSlider from '../src/index';
import { events } from '../src/plugin';

const SLIDER = ( id, attribute = '' ) => `
	<div id="${ id }" data-storepress-slider${ attribute }>
		<div class="slide">1</div>
		<div class="slide">2</div>
		<div class="slide">3</div>
		<button class="prev">Prev</button>
		<button class="next">Next</button>
	</div>
`;

// Wait for MutationObserver callbacks (autoRemove).
const flushObservers = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'StorePressSlider', () => {
	let $hero;
	let $second;

	const getInstance = ( selector ) => StorePressSlider.get( selector )[ 0 ];
	const activeSlide = ( $slider ) =>
		[ ...$slider.querySelectorAll( '.slide' ) ].findIndex( ( $slide ) =>
			$slide.classList.contains( 'is-active' )
		);
	const pressKey = ( $target, key ) =>
		$target.dispatchEvent( new KeyboardEvent( 'keydown', { key, bubbles: true } ) );

	beforeEach( () => {
		document.body.innerHTML =
			SLIDER( 'hero' ) + SLIDER( 'second', `='{"loop": false}'` );
		$hero = document.getElementById( 'hero' );
		$second = document.getElementById( 'second' );
		StorePressSlider.init();
	} );

	afterEach( () => {
		// Remove instances and their listeners, including those on document.
		StorePressSlider.destroy();
	} );

	describe( 'setup', () => {
		it( 'creates one instance per element', () => {
			expect( StorePressSlider.get() ).toHaveLength( 2 );
			expect( getInstance( '#hero' ).element ).toBe( $hero );
		} );

		it( 'does not stack listeners when init() runs again', () => {
			StorePressSlider.init();

			const [ { $events } ] = events.getAll( $hero );
			expect( $events.every( ( { size } ) => size === 1 ) ).toBe( true );
		} );

		it( 'reads settings from data-* attributes', () => {
			expect( getInstance( '#hero' ).settings.loop ).toBe( true );
			expect( getInstance( '#second' ).settings.loop ).toBe( false );
		} );

		it( 'rebuilds an instance with new settings on reload()', () => {
			StorePressSlider.reload( '#hero', { start: 2 } );

			expect( getInstance( '#hero' ).getIndex() ).toBe( 2 );
			expect( activeSlide( $hero ) ).toBe( 2 );
		} );
	} );

	describe( 'behavior', () => {
		it( 'moves to the next slide on click', () => {
			$hero.querySelector( '.next' ).click();

			expect( getInstance( '#hero' ).getIndex() ).toBe( 1 );
			expect( activeSlide( $hero ) ).toBe( 1 );
		} );

		it( 'loops only when loop is on', () => {
			$hero.querySelector( '.prev' ).click();
			$second.querySelector( '.prev' ).click();

			expect( getInstance( '#hero' ).getIndex() ).toBe( 2 );
			expect( getInstance( '#second' ).getIndex() ).toBe( 0 );
		} );

		it( 'handles arrow keys only in the focused slider', () => {
			const $next = $hero.querySelector( '.next' );
			$next.focus();
			pressKey( $next, 'ArrowRight' );

			expect( getInstance( '#hero' ).getIndex() ).toBe( 1 );
			expect( getInstance( '#second' ).getIndex() ).toBe( 0 );
		} );
	} );

	describe( 'events', () => {
		it( 'announces slide-change to other scripts', () => {
			const listener = jest.fn();
			document.addEventListener( 'storepress:slider-ui:slide-change', listener );

			getInstance( '#hero' ).next();

			expect( listener ).toHaveBeenCalledTimes( 1 );
			const [ event ] = listener.mock.calls[ 0 ];
			expect( event.target ).toBe( $hero );
			expect( event.detail ).toEqual( { index: 1 } );

			document.removeEventListener( 'storepress:slider-ui:slide-change', listener );
		} );

		it( 'moves when another script triggers go-to', () => {
			triggerEvent( $hero, 'storepress:slider-ui:go-to', { index: 2 } );

			expect( getInstance( '#hero' ).getIndex() ).toBe( 2 );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'removes classes and its own listeners on destroy()', () => {
			StorePressSlider.destroy( '#hero' );

			expect( activeSlide( $hero ) ).toBe( -1 );
			expect( events.getAll( $hero ) ).toEqual( [] );

			// The other instance still has its listeners.
			expect( events.getAll( $second ) ).toHaveLength( 1 );
			const [ { $events } ] = events.get( document );
			expect( $events[ 0 ].size ).toBe( 1 ); // Only #second's keydown is left.
		} );

		it( 'cleans up when the markup is removed without destroy()', async () => {
			$hero.remove();
			await flushObservers();

			// autoRemove dropped the listeners on the removed element.
			expect( events.getAll( $hero ) ).toEqual( [] );

			// The document keydown handler removes itself on the next key press.
			pressKey( document, 'ArrowRight' );
			const [ { $events } ] = events.get( document );
			expect( $events[ 0 ].size ).toBe( 1 );
		} );
	} );
} );
```

### Tips

- **Destroy in `afterEach`.** The event manager and the `document` listeners outlive a test, because modules are loaded once per file. `StorePressSlider.destroy()` runs each `reset()`, so the next test starts clean.
- **Check cleanup with `events.getAll( element )`.** It returns `[]` once every listener on the element is removed, and `events.get( document )` shows how many `document` handlers are left (`size`).
- **Test the shared targets.** Destroy one instance and check the others still work. That catches a `reset()` that calls `removeAll()` without a target.
- **Wait for `autoRemove`.** Removed elements lose their listeners in a `MutationObserver` callback, so `await` a timeout before asserting.
- **Dispatch events like the browser does.** Use `element.click()` for clicks and `new KeyboardEvent( 'keydown', { key, bubbles: true } )` for keys, so they reach listeners on `document`. Focus the element first when the handler checks `document.activeElement`.
- **Listen with plain `addEventListener`** to check custom events, as another script would, and remove the listener at the end of the test.

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
events.removeAll( '.mini-cart' );     // Everything on one element.
events.removeAll();                   // Everything in the namespace.

events.getAll( '.mini-cart' );        // What one element has attached.
events.getAll();                      // Every element in the namespace.
```

Methods: `add`, `set` (replace handlers for an event), `trigger`, `remove`, `removeAll` (all, or every listener on given elements), `get` and `getAll` (inspect what is attached), and `getEventName` (`events.getEventName( 'updated' )` returns `'storepress:mini-cart:updated'`). Listeners on an element are removed automatically when the element is removed from the page; pass `{ autoRemove: false }` to turn that off.

Inside a plugin function, a single `AbortController` (as in the [plugin template](#1-the-plugin-pluginjs)) is usually enough. To build a plugin on the event manager, see [Plugin with an event manager](#plugin-with-an-event-manager).

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

- **Clean up everything you add.** Every listener, class and CSS property a plugin adds should be removed in `reset()`. Use one `AbortController` per instance, or `events.removeAll( element )` with an event manager.
- **Use descriptive namespaces.** `'product-quick-view'`, not `'modal'`. The namespace names the global registry entry and the custom events, so it must be unique across plugins on the page.
- **Listen only while needed.** Add `keydown` or overlay `click` listeners when a modal opens and remove them when it closes, instead of checking an `isOpen` flag on every event.
- **Use passive listeners for scroll and touch.** `{ passive: true }` matters for `scroll`, `wheel`, `touchstart` and `touchmove`; it has no effect on other events.
- **Delegate when there are many children.** One `click` listener on a list with `event.target.closest( '.item' )` beats one listener per item, and keeps working for items added later.
- **Test setup and cleanup.** Init, act, destroy, then check that `events.getAll( element )` is empty. See [Testing a plugin](#testing-a-plugin).
- **Debug from the console.** `events.getAll()` lists every element and event in a namespace (`events.getAll( element )` for one element), and `window.StorePress.$Plugins` lists every registered plugin.

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
