# Plugin system

Helpers for building DOM plugins (sliders, tabs, quantity steppers, and so on) that run once per element, can be started, stopped and reloaded through document events, and can be reached from other scripts through `window.StorePress`.

```js
import {
	createPlugin,
	createStorePressPlugin,
	createPluginInstance,
	getPluginInstance,
} from '@storepress/utils';
```

| Function | Description |
| --- | --- |
| [`createPlugin`](#createplugin) | Creates a plugin manager that runs a plugin function on elements through `init`, `destroy` and `reload` events. |
| [`createStorePressPlugin`](#createstorepressplugin) | Same as `createPlugin`, and also registers the manager on `window.StorePress`. |
| [`createPluginInstance`](#createplugininstance) | Creates one instance per element (or returns the existing one). |
| [`getPluginInstance`](#getplugininstance) | Returns existing instances for elements, without creating any. |

## How it fits together

```
createStorePressPlugin( config )      → controller, saved at window.StorePress.$Plugins.ProductSlider.Plugin
  └─ controller.setup()               → listens on document for storepress:product_slider:{init,destroy,reload}
       controller.init()              → event → createPluginInstance() → new ProductSlider( element, settings ) → { reset, ... }
                                         instance saved at window.StorePress.$Plugins.ProductSlider.Instance (WeakMap)
       controller.get()               → getPluginInstance() → [ instance, ... ]
       controller.reload( el, opts )  → destroy + init with new settings
       controller.destroy()           → event → instance.destroy() → "destroy" event on the element → reset()
  └─ controller.clear()               → destroy() + remove document listeners + abort controller
```

1. **Create.** Call `createStorePressPlugin()` (or `createPlugin()` if no other script needs it) with your plugin function, a default selector, default options and a namespace.
2. **Set up.** `setup()` adds the document listeners. Nothing is created yet.
3. **Init.** `init()` creates one instance per matching element. Running it again skips elements that already have one, so it is safe after AJAX updates.
4. **Use.** `get()` returns the instances, so you can call their public methods.
5. **Destroy.** `destroy()` runs each instance's `reset()` and forgets the instance. `reload()` is destroy plus init. `clear()` also removes the listeners.

### Writing a plugin

A plugin is a plain function. It receives `( element, settings )`, sets up that one element, and returns the instance's public API. The manager calls it with `new`, and the returned object becomes the instance.

```js
import { deepMerge, getOptionsFromAttribute } from '@storepress/utils';

const DEFAULTS = { autoplay: false, speed: 300 };
const ATTRIBUTE = 'product-slider'; // data-product-slider

function ProductSlider( element, options ) {
	const settings = deepMerge( DEFAULTS, options, getOptionsFromAttribute( element, ATTRIBUTE ) );
	const controller = new AbortController();
	const $next = element.querySelector( '.next' );

	const next = () => {
		// Show the next slide.
	};

	// Called by the manager on destroy, so the name must stay `reset`.
	const reset = () => {
		controller.abort();
	};

	$next.addEventListener( 'click', next, { signal: controller.signal } );

	// Do not use `element` or `destroy` as keys: the manager sets them.
	return { reset, next, settings };
}
```

- **Don't use `this`.** Keep state in local variables. Values set on `this` end up on an object that is thrown away, and a call without `new` throws in strict mode.
- **Return `reset`.** It runs once on destroy and must remove every listener, class and style the plugin added. Pass one `AbortController` signal to every listener and call `controller.abort()` in `reset`.
- **Don't return `element` or `destroy`.** `createPluginInstance()` sets both on the returned object and overwrites yours.
- **Merge settings with `deepMerge`.** Order: plugin defaults, then the manager's options, then `data-*` attributes.

See the [package README](../../README.md#building-a-plugin) for the full template and the rules behind it.

Classes still work: the manager only needs a constructor that returns or is an object with `reset`. If you use a class, define `reset` as an arrow-function field (`reset = () => {}`), because it is attached as an event listener and a normal method gets the element as `this`.

---

## createPlugin

Creates a plugin manager (also called the controller). After `setup()`, it listens on `document` for three custom events and runs the plugin function on the elements in the event detail:

| Controller call | Event dispatched on `document` | What happens per element |
| --- | --- | --- |
| `init( selector, settings )` | `storepress:{namespace}:init` | Creates an instance, once per element |
| `destroy( selector )` | `storepress:{namespace}:destroy` | Calls `instance.destroy()`, which runs `reset()` |
| `reload( selector, settings )` | `storepress:{namespace}:reload` | Destroy, then init with the new settings |

`{namespace}` is the namespace in snake_case (`product-slider` → `product_slider`). The event detail is `{ element, settings }`. Any script can dispatch these events, without importing the plugin.

```js
createPlugin( { selector, options, plugin, namespace, callback } ) → controller
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string \| Element \| Element[] \| NodeList` | | Default targets when a method is called without one. |
| `options` | `Object` | `{}` | Default settings for new instances. |
| `plugin` | `Function` | | Plugin function, called with `new plugin( element, settings )`. Returns the instance's public API, including `reset`. |
| `namespace` | `string` | | Unique plugin name, e.g. `'product-slider'`. |
| `callback.onSetup` | `Function` | `() => {}` | Runs at the end of `setup()`. `this` is the controller. |
| `callback.onClear` | `Function` | `() => {}` | Runs at the end of `clear()`. `this` is the controller. |

**Returns:** a controller object.

| Member | Description |
| --- | --- |
| `setup( { selector, options, callback } )` | Merges overrides into the config, creates the event manager and `AbortController`, adds the document listeners, calls `onSetup`. |
| `init( selector, settings )` | Creates instances. Defaults to `config.selector` and `config.options`. |
| `destroy( selector )` | Destroys instances. |
| `reload( selector, settings )` | Destroys, then initializes again. |
| `get( selector )` | Returns the instances for the targets. |
| `clear( selector )` | `destroy()`, removes the listeners, aborts the controller, calls `onClear`. |
| `controller` | The `AbortController` for this setup. Pass `controller.signal` to your own listeners so `clear()` removes them. |
| `instance` | `{ init, destroy, reload }` that act right away, without events. |
| `config` | `{ selector, options, callback }` after `setup()`. |
| `$event` | The event manager used for the document listeners. |

**Use case:** the main entry point of a storefront plugin. Set it up once on page load, call `init()` again after AJAX updates, and `reload()` when settings or markup change.

**Example: basic**

```js
const Slider = createPlugin( {
	selector: '.product-slider',
	options: { autoplay: true, speed: 300 },
	plugin: ProductSlider,
	namespace: 'product-slider',
} );

Slider.setup();
Slider.init();                 // One ProductSlider per .product-slider
Slider.get( '#hero-slider' );  // [ ProductSlider ]
Slider.destroy();              // reset() on each instance
```

**Example: re-init after WooCommerce AJAX and rebuild on variation change**

```js
// New markup from cart fragments or quick view. Existing sliders are skipped.
jQuery( document.body ).on( 'wc_fragments_refreshed', () => Slider.init() );

// Gallery images change with the selected variation.
jQuery( '.variations_form' )
	.on( 'found_variation', () => {
		Slider.reload( '.woocommerce-product-gallery .product-slider' );
	} )
	.on( 'reset_data', () => {
		Slider.reload( '.woocommerce-product-gallery .product-slider' );
	} );
```

**Example: listeners that `clear()` removes**

```js
const Slider = createPlugin( {
	selector: '.product-slider',
	plugin: ProductSlider,
	namespace: 'product-slider',
	callback: {
		onSetup() {
			window.addEventListener( 'resize', () => this.reload(), {
				signal: this.controller.signal,
			} );
		},
	},
} );

Slider.setup();
Slider.init();
Slider.clear(); // Instances reset, document and resize listeners removed.
```

**Notes:**

- Call `setup()` first. `get()`, `init()`, `destroy()`, `reload()` and `clear()` throw a TypeError before it, because `config` does not exist yet.
- `init( selector, settings )` and `reload( selector, settings )` pass `settings` as is. They are **not** merged with the default `options`. Spread them yourself: `{ ...Slider.config.options, speed: 600 }`.
- Running `setup()` again removes the old document listeners but does not abort the old `controller`. Call `clear()` before setting up again.
- When an element is removed from the page, its instance can be garbage collected, but `reset()` does not run. Call `destroy()` before removing markup if the plugin added listeners outside its element.
- `createPlugin` does not register the controller globally. Use `createStorePressPlugin` for that.

---

## createStorePressPlugin

Creates a controller with `createPlugin()` and stores it at `window.StorePress.$Plugins[ Name ].Plugin`, where `Name` is the namespace in UpperCamelCase (`product-slider` → `ProductSlider`). Other bundles can then get it with `getStorePressPlugin( 'product-slider' )`.

```js
createStorePressPlugin( { selector, options, plugin, namespace, callback } ) → controller
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string \| Element \| Element[] \| NodeList` | | Default targets. |
| `options` | `Object` | `{}` | Default settings for new instances. |
| `plugin` | `Function` | | Plugin function. |
| `namespace` | `string` | | Unique plugin name. Sets the global key and event names. |
| `callback.onSetup` | `Function` | `() => {}` | Runs at the end of `setup()`. |
| `callback.onClear` | `Function` | `() => {}` | Runs at the end of `clear()`. |

**Returns:** the same controller as `createPlugin()`.

**Use case:** plugins that themes, add-ons or inline scripts need to control without importing the plugin bundle.

**Example: basic**

```js
const Slider = createStorePressPlugin( {
	selector: '.product-slider',
	options: { speed: 300 },
	plugin: ProductSlider,
	namespace: 'product-slider',
} );

window.StorePress.$Plugins.ProductSlider.Plugin === Slider; // true
Slider.setup();
Slider.init();
```

**Example: plugin entry file with settings from PHP**

```js
// Enqueued with wp_enqueue_script(); settings from wp_localize_script().
document.addEventListener( 'DOMContentLoaded', () => {
	const Slider = createStorePressPlugin( {
		selector: '.storepress-product-slider',
		options: window.StorePressProductSliderSettings,
		plugin: ProductSlider,
		namespace: 'product-slider',
	} );

	Slider.setup();
	Slider.init();
} );
```

**Example: an add-on controls the slider without importing it**

```js
jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
	getStorePressPlugin( 'product-slider' ).init?.( '.mini-cart .storepress-product-slider' );
} );

// Or with no imports at all:
document.dispatchEvent(
	new CustomEvent( 'storepress:product_slider:init', {
		detail: { element: '.mini-cart .storepress-product-slider', settings: { speed: 300 } },
	} )
);
```

**Notes:**

- Registering the same namespace twice replaces the stored controller. Call `clear()` on the old one first, or its document listeners stay active.
- The controller is registered but not set up. Call `setup()` and `init()` yourself.
- If `getStorePressPlugin()` runs before registration, it stores a placeholder `{}` that is later replaced. A reference saved before registration stays empty.

---

## createPluginInstance

Creates one instance per element and stores it in `window.StorePress.$Plugins[ Name ].Instance` (a WeakMap). If an element already has an instance, that instance is returned instead. Each new instance gets two extra properties:

| Property | Value |
| --- | --- |
| `instance.element` | The element. |
| `instance.destroy()` | Dispatches a non-bubbling `destroy` event on the element and removes the instance from the store. |

```js
createPluginInstance( selectors, options, plugin, namespace ) → Array<instance>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `selectors` | `string \| Element \| Element[] \| NodeList` | | Targets, as accepted by `getElements()`. |
| `options` | `Object` | | Second argument for the plugin function. Ignored for existing instances. |
| `plugin` | `Function` | | Plugin function. |
| `namespace` | `string` | | Plugin namespace. |

**Returns:** one instance per matched element (new or existing), in document order. Empty when nothing matches.

**Use case:** one instance per element without the event manager, for small scripts and tests. `createPlugin()` uses it internally and also wires `reset` to the `destroy` event.

**Example: basic**

```js
const [ slider ] = createPluginInstance( '#hero-slider', { speed: 300 }, ProductSlider, 'product-slider' );
slider.element; // <div id="hero-slider">

// Same element, same instance:
createPluginInstance( '#hero-slider', {}, ProductSlider, 'product-slider' )[ 0 ] === slider; // true
```

**Example: cleanup with the `destroy` event**

Without the manager, nothing calls `reset` for you. Listen for the `destroy` event that `instance.destroy()` dispatches on the element.

```js
function ReadMore( element, { lines } ) {
	const controller = new AbortController();
	const button = element.querySelector( '.read-more' );
	const toggle = () => element.classList.toggle( 'is-open' );

	element.style.setProperty( '--lines', lines );
	button.addEventListener( 'click', toggle, { signal: controller.signal } );
	element.addEventListener( 'destroy', () => controller.abort(), { once: true } );

	return {};
}

const [ readMore ] = createPluginInstance( '.product-description', { lines: 4 }, ReadMore, 'read-more' );
readMore.destroy(); // Removes the click listener and forgets the instance.
```

**Example: apply new options to an existing element**

```js
getPluginInstance( '#hero-slider', 'product-slider' )[ 0 ]?.destroy();
createPluginInstance( '#hero-slider', { speed: 600 }, ProductSlider, 'product-slider' );
```

**Notes:**

- `options` only apply when an instance is created. Destroy first to change them.
- `element` and `destroy` are set on the returned object after the plugin function runs, and overwrite properties with the same name. Don't return either key.
- The plugin function is called with `new`, so arrow functions can't be used as plugins.
- The store is a WeakMap: an instance is freed with its element, but no cleanup code runs in that case.

---

## getPluginInstance

Returns the existing instances for the targets. Elements without an instance are skipped. It never creates one.

```js
getPluginInstance( selectors, namespace ) → Array<instance>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `selectors` | `string \| Element \| Element[] \| NodeList` | | Targets, as accepted by `getElements()`. |
| `namespace` | `string` | | Plugin namespace. |

**Returns:** instances for the matched elements that have one. Empty when none do.

**Use case:** calling public methods on a running plugin from another script, or checking whether an element is already initialized.

**Example: basic**

```js
getPluginInstance( '.product-slider', 'product-slider' ); // [ ProductSlider, ProductSlider ]
getPluginInstance( '#not-initialized', 'product-slider' ); // []
```

**Example: control a slider from gallery thumbnails**

```js
document.querySelectorAll( '.gallery-thumbnail' ).forEach( ( thumbnail ) => {
	thumbnail.addEventListener( 'click', () => {
		getPluginInstance( '#hero-slider', 'product-slider' )[ 0 ]?.goTo( Number( thumbnail.dataset.index ) );
	} );
} );
```

**Example: pause every slider while a modal is open**

```js
jQuery( document.body ).on( 'quick-view-opened', () => {
	getPluginInstance( '.product-slider', 'product-slider' ).forEach( ( slider ) => slider.pause() );
} );
```

**Notes:**

- The result can be shorter than the list of matched elements, so its indexes do not match the selector result.
- The store is a WeakMap and cannot be listed. Pass a selector that matches every element you care about.
