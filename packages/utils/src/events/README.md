# Event utilities

Helpers for dispatching custom events with data, detecting swipe gestures, and managing DOM listeners with automatic cleanup. They are written for storefront scripts such as mini-cart drawers, product galleries, and quick view modals.

```js
import { triggerEvent, swipeEvent, createEventManager } from '@storepress/utils';
```

| Function | Description |
| --- | --- |
| [`triggerEvent`](#triggerevent) | Dispatches a `CustomEvent` with data on one or more targets. |
| [`swipeEvent`](#swipeevent) | Detects swipe gestures on an element and reports distance and direction. |
| [`createEventManager`](#createeventmanager) | Creates a namespaced listener manager with grouped removal and automatic cleanup. |

---

## triggerEvent

Dispatches a `CustomEvent` on every resolved target, with your data in `event.detail`. Targets are resolved with `getElements`, so a selector, an element, a list, `document` or `window` all work.

```js
triggerEvent( $targets, eventType, eventDetails = {}, options = {} );
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `$targets` | `string \| Element \| Document \| Window \| ArrayLike<Element>` | | Target(s) to dispatch on. |
| `eventType` | `string` | | Event name, e.g. `'storepress:cart:updated'`. |
| `eventDetails` | `Object` | `{}` | Data copied (shallow) into `event.detail`. |
| `options.bubbles` | `boolean` | `false` | Whether the event bubbles up the DOM tree. |
| `options.cancelable` | `boolean` | `true` | Whether `preventDefault()` marks the event as canceled. |
| `options.composed` | `boolean` | `false` | Whether the event crosses a shadow DOM boundary. |

**Returns:** nothing (`undefined`).

**Use case:** let other parts of your plugin, the theme, or third-party scripts react to something your code did (cart updated, variation changed, quick view requested) without importing each other.

```js
// Basic
triggerEvent( '#mini-cart', 'storepress:mini-cart:opened' );
triggerEvent( button, 'storepress:quantity:changed', { quantity: 3 } );
```

```js
// After AJAX add-to-cart, tell every widget the cart changed
triggerEvent( document.body, 'storepress:cart:updated', { productId, quantity, fragments } );

document.body.addEventListener( 'storepress:cart:updated', ( event ) => {
  document.querySelector( '.cart-count' ).textContent = event.detail.quantity;
} );
```

```js
// Bubble from each product card, handle once on the grid
triggerEvent( button, 'storepress:quick-view:request', { productId: 42 }, { bubbles: true } );

document.querySelector( '.products' ).addEventListener( 'storepress:quick-view:request', ( event ) => {
  openQuickView( event.detail.productId );
} );
```

**Notes:**

- It returns nothing, so you can't read "was it canceled" from the return value. Use `dispatchEvent()` directly for that.
- `eventDetails` is spread into an object. An array becomes `{ 0: ..., 1: ... }`, so wrap it: `{ items: [ ... ] }`.
- Nested objects in `eventDetails` are shared with listeners, not copied.
- It always dispatches a `CustomEvent`. Triggering `'click'` this way does not follow links or submit forms.

---

## swipeEvent

Listens for touch events, and mouse and pen pointer events unless you turn them off. While the gesture moves it dispatches a `swipe` event on the target, plus one final event when the gesture ends. `listenerFn` receives every one of them.

```js
const cleanup = swipeEvent( target, listenerFn, options = {} );
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Element` | | Element to watch. Must be an element, not a selector. |
| `listenerFn` | `( event: CustomEvent ) => void` | | Called for every `swipe` event. |
| `options.offset` | `number` | `10` | Pixels a gesture must pass before a direction flag becomes `true`. |
| `options.touchOnly` | `boolean` | `false` | Ignore mouse and pen; listen to touch only. |

**Returns:** `() => void`, a cleanup function that removes every listener, including `listenerFn`.

`event.detail`:

| Property | Type | Meaning |
| --- | --- | --- |
| `x`, `y` | `number` | Distance from the start point. Negative `x` is left, negative `y` is up. |
| `left`, `right`, `top`, `bottom` | `boolean` | Moved more than `offset` pixels in that direction. |
| `moving` | `boolean` | `true` while the gesture is in progress. |
| `done` | `boolean` | `true` once, on the final event. |

**Use case:** swipe through a mobile product gallery, drag a mini-cart drawer closed, or swipe a store notice away.

```js
// Basic
const stop = swipeEvent( element, ( { detail } ) => {
  if ( detail.done && detail.left ) {
    showNext();
  }
} );

stop(); // when the component is destroyed
```

```js
// Mobile product gallery, touch only, ignoring mostly-vertical gestures
swipeEvent(
  gallery,
  ( { detail } ) => {
    if ( ! detail.done || Math.abs( detail.x ) < Math.abs( detail.y ) ) {
      return;
    }
    detail.left ? nextImage() : previousImage();
  },
  { offset: 40, touchOnly: true }
);
```

```js
// Drag the mini-cart drawer closed with live feedback
swipeEvent( drawer, ( { detail } ) => {
  const distance = Math.max( 0, detail.x );
  if ( detail.moving ) {
    drawer.style.transform = `translateX( ${ distance }px )`;
    return;
  }
  drawer.style.transform = '';
  if ( distance > drawer.offsetWidth / 3 ) {
    drawer.classList.remove( 'is-open' );
  }
} );
```

**Notes:**

- A tap or click with no movement fires no `swipe` event.
- A diagonal gesture can set two flags, e.g. `left` and `bottom`.
- `moving` events fire on every move. Keep that handler light.
- With pointer events on, a mouse drag counts as a swipe. Use `touchOnly: true` when desktop users should select text or drag images.
- Touch listeners are passive, so the page still scrolls. For horizontal galleries add `touch-action: pan-y` to the target in CSS.
- The `swipe` event is dispatched on `target`, so every other `swipe` listener on that element also receives it.

---

## createEventManager

Creates a manager for one namespace. It adds, replaces, triggers and removes listeners. Every listener has its own `AbortController`, so it can be removed without keeping the handler. When an element is removed from the page, its listeners go with it.

```js
const events = createEventManager( namespace, options = {} );
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `namespace` | `string` | | Groups this manager's listeners, e.g. `'quick-view'`. |
| `options.prefix` | `string` | `'storepress'` | Prefix for custom event names and the global store key. `''` falls back to `'$global'`. |
| `options.separator` | `string` | `':'` | Separator in custom event names. |
| `options.autoRemove` | `boolean` | `true` | Remove an element's listeners when it is removed from the page. |

**Returns:** the manager object. Every method except `get` and `getAll` returns the manager, so calls can be chained.

| Method | Description |
| --- | --- |
| `add( $targets, eventType, handler, eventOptions )` | Adds a handler. Several handlers per event are allowed; the same reference twice is ignored. |
| `set( $targets, eventType, handler, eventOptions )` | Removes every handler of that event in this namespace, then adds this one. |
| `trigger( $targets, eventType, eventDetails, triggerOptions )` | Dispatches registered events. Custom events get `eventDetails` in `event.detail`. |
| `remove( $targets, eventType, handler )` | Removes one handler, one event, or every event on the element. |
| `removeAll( $targets )` | Removes every listener in the namespace, or every listener on `$targets` only when given. |
| `get( $targets )` | Lists registered events, with handler counts, for the given elements. |
| `getAll( $targets )` | Lists every tracked element and its events in the namespace, or only the tracked elements among `$targets` when given. |

Event names: if the element has an `on{type}` property (`onclick`, `onkeydown`, `onchange`), the event is **native** and attached by its real name. Anything else is **custom** and attached as `{prefix}{separator}{namespace}{separator}{type}`, e.g. `storepress:quick-view:open`.

**Use case:** plugins and components that must clean up after themselves (a quick view modal, a mini-cart drawer, a product slider), setup code that re-runs after AJAX without stacking listeners, and custom events with data between modules.

```js
// Basic
const events = createEventManager( 'slider' );

events
  .add( '.slider-next', 'click', goNext )
  .add( '.slider', 'slide-changed', ( { detail } ) => updateDots( detail.index ) );

events.trigger( '.slider', 'slide-changed', { index: 2 } );
events.removeAll();
```

```js
// Quick view modal: every listener goes away on close
class QuickView {
  constructor( $modal ) {
    this.$modal = $modal;
    this.events = createEventManager( 'quick-view' );
    this.events
      .add( $modal.querySelector( '.close' ), 'click', this.close )
      .add( document, 'keydown', this.onKeyDown );
  }

  onKeyDown = ( event ) => event.key === 'Escape' && this.close();

  close = () => {
    this.$modal.hidden = true;
    this.events.removeAll();
  };
}
```

```js
// Product grid re-rendered after AJAX filtering
const grid = createEventManager( 'product-grid' );

function render( html ) {
  document.querySelector( '.products' ).innerHTML = html; // old cards' listeners are auto-removed
  grid.set( '.products .add_to_cart_button', 'click', ( event ) => {
    event.preventDefault();
    addToCart( event.currentTarget.dataset.product_id );
  } );
}
```

**Notes:**

- Custom names that match a native property (`'change'`, `'input'`, `'toggle'`, `'select'`, `'submit'`, `'load'`, ...) are treated as native, and `event.detail` is `undefined`. Use names like `'slide-changed'` to pass data.
- Native events triggered with `trigger` are dispatched as a plain bubbling `Event`. `eventDetails` and `triggerOptions` are ignored.
- `trigger( $element )` with no event type fires custom events only. Native handlers are skipped.
- Custom events don't bubble unless you pass `{ bubbles: true }` as `triggerOptions`.
- Managers with the same prefix and namespace share listeners, so `set` and `removeAll` affect both. Use one namespace per feature or instance.
- Targets must be HTML elements or `document`. `window` and SVG elements are not supported: `add` throws `TypeError: WeakRef: invalid target`.
- `document` listeners and elements that stay on the page are never auto-removed. Call `removeAll()` on destroy.
- With `autoRemove`, an element moved in the same task keeps its listeners. An element detached and re-inserted later loses them. Use `{ autoRemove: false }` for that pattern.
- `getAll().filter( ( { $element } ) => ! $element.isConnected )` lists elements that left the page but are still tracked.
