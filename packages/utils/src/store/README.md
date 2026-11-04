# Global stores

Accessors for the shared state on `window.StorePress`: plugin controllers, plugin instances, and event-manager listeners. All bundles on the page that use `@storepress/utils` share this state, even when each one ships its own copy of the package.

```js
import {
	getPluginInstanceStore,
	getStorePressPlugin,
	getEventStore,
} from '@storepress/utils';
```

| Function | Description |
| --- | --- |
| [`getPluginInstanceStore`](#getplugininstancestore) | Returns the WeakMap of element → plugin instance for a namespace. |
| [`getStorePressPlugin`](#getstorepressplugin) | Returns the plugin controller registered for a namespace, or `{}`. |
| [`getEventStore`](#geteventstore) | Returns the Map that event managers use for one event prefix. |

## The `window.StorePress` layout

```
window.StorePress = {
	$Plugins: {
		ProductSlider: {                           // namespace 'product-slider' in UpperCamelCase
			Plugin:   <controller>,                // createStorePressPlugin()  → getStorePressPlugin()
			Instance: WeakMap { element => instance }, // createPluginInstance() → getPluginInstanceStore()
		},
	},
	$Events: {
		StorePress: Map {                          // event prefix 'storepress' in UpperCamelCase → getEventStore()
			'product_slider' => WeakElementMap { element => { eventName => Map { handler => AbortController } } },
			'cart'           => WeakElementMap { ... },
		},
		$global: Map { ... },                      // createEventManager( ns, { prefix: '' } )
	},
};
```

- Every key is created on first use. Each accessor creates any missing parent objects.
- Names go through `toUpperCamelCase()`, so `'product-slider'`, `'product_slider'` and `'ProductSlider'` point to the same entry.
- All three functions need `window` and throw a ReferenceError during server-side rendering or in Node without a DOM.
- In tests, `delete window.StorePress` in `beforeEach` gives every test clean stores.

---

## getPluginInstanceStore

Returns the WeakMap at `window.StorePress.$Plugins[ Name ].Instance`, creating it if needed. Keys are elements and values are plugin instances.

```js
getPluginInstanceStore( namespace ) → WeakMap<Element, Object>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `namespace` | `string` | | Plugin namespace, e.g. `'product-slider'`. |

**Returns:** the shared instance store for the namespace.

**Use case:** low-level checks and custom instance handling. In most code, use `createPluginInstance()` and `getPluginInstance()`, which read and write this store for you.

**Example: basic**

```js
const store = getPluginInstanceStore( 'product-slider' );
store === window.StorePress.$Plugins.ProductSlider.Instance; // true
store.has( document.querySelector( '#hero-slider' ) );       // true once initialized
```

**Example: show a placeholder until the slider is ready**

```js
const $slider = document.querySelector( '#hero-slider' );
$slider.classList.toggle( 'is-loading', ! getPluginInstanceStore( 'product-slider' ).has( $slider ) );
```

**Example: track slide changes of an instance created by another bundle**

```js
const slider = getPluginInstanceStore( 'product-slider' ).get( document.querySelector( '#hero-slider' ) );

if ( slider ) {
	const goTo = slider.goTo.bind( slider );
	slider.goTo = ( index ) => {
		window.dataLayer?.push( { event: 'slider_change', index } );
		goTo( index );
	};
}
```

**Notes:**

- Entries are freed when their element is garbage collected. An instance that references its own element does not prevent this.
- A WeakMap cannot be listed or counted. Query elements and check each one.

---

## getStorePressPlugin

Returns the controller at `window.StorePress.$Plugins[ Name ].Plugin`. If no plugin is registered yet, it stores and returns an empty placeholder `{}`.

```js
getStorePressPlugin( namespace ) → Object
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `namespace` | `string` | | Plugin namespace, e.g. `'product-slider'`. |

**Returns:** the controller registered by `createStorePressPlugin()`, or `{}`.

**Use case:** controlling a plugin from another bundle (theme, add-on, inline script) without importing it.

**Example: basic**

```js
getStorePressPlugin( 'product-slider' ); // {} before registration

const Slider = createStorePressPlugin( { selector: '.product-slider', plugin: ProductSlider, namespace: 'product-slider' } );
getStorePressPlugin( 'product-slider' ) === Slider; // true
```

**Example: re-init the slider after WooCommerce AJAX**

```js
jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
	getStorePressPlugin( 'product-slider' ).init?.();
} );
```

**Example: feature detection**

```js
const Slider = getStorePressPlugin( 'product-slider' );
if ( typeof Slider.get === 'function' ) {
	Slider.get( '#hero-slider' )[ 0 ]?.pause();
}
```

**Notes:**

- It never returns `undefined`. Check for a method before calling it (`init?.()`).
- The placeholder is replaced, not filled, when the plugin registers. Do not save the result at load time; call the function when you need the plugin.

---

## getEventStore

Returns the Map at `window.StorePress.$Events[ Name ]`, creating it if needed. `createEventManager()` calls it with its `prefix` (default `'storepress'`, stored as `StorePress`; an empty prefix becomes `$global`). Each key is an event-manager namespace and each value is a weak element store of that namespace's listeners.

```js
getEventStore( namespace ) → Map<string, WeakElementMap>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `namespace` | `string` | | Store key. For event managers this is the event prefix, e.g. `'storepress'`. |

**Returns:** the shared Map of event-manager namespace → element store.

**Use case:** inspecting which features have listeners while debugging. To change listeners, use an event manager, which also aborts the listeners.

**Example: basic**

```js
const store = getEventStore( 'storepress' );
store === window.StorePress.$Events.StorePress; // true
[ ...store.keys() ];                             // [ 'product_slider', 'cart', ... ]
```

**Example: list features with listeners, in the browser console**

```js
console.table(
	[ ...getEventStore( 'storepress' ).keys() ].map( ( namespace ) => ( {
		namespace,
		elements: createEventManager( namespace ).getAll().length,
	} ) )
);
```

**Example: a custom prefix keeps listeners separate**

```js
createEventManager( 'cart', { prefix: 'my-shop' } ).add( '.cart', 'click', onCartClick );

getEventStore( 'my-shop' ).has( 'cart' );    // true
getEventStore( 'storepress' ).has( 'cart' ); // false
```

**Notes:**

- A namespace key appears once a listener is added, not when the manager is created.
- Deleting entries from the Map directly leaves the listeners attached. Use `createEventManager( namespace ).removeAll()`.
