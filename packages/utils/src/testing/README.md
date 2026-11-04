# Testing helpers

Delay helpers for unit tests, Storybook stories and demos. Use them to simulate slow AJAX responses, CSS transitions or heavy synchronous work. They are not meant for production code.

```js
import { testWaitAsync, testWaitSync } from '@storepress/utils';
```

| Function                          | Description                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| [`testWaitAsync`](#testwaitasync) | Returns a promise that resolves with `data` after `milliseconds`, without blocking. |
| [`testWaitSync`](#testwaitsync)   | Blocks the main thread for `milliseconds`, then returns `data`.                     |

---

## testWaitAsync

Returns a promise that resolves with `data` after `milliseconds`. The delay uses `setTimeout`, so the page stays responsive while waiting. Because it resolves with whatever you pass, it is an easy way to fake a server response.

```js
testWaitAsync( milliseconds, data = {} ): Promise<T>
```

| Parameter      | Type     | Default | Description                                |
| -------------- | -------- | ------- | ------------------------------------------ |
| `milliseconds` | `number` | -       | Minimum delay before the promise resolves. |
| `data`         | `T`      | `{}`    | Value the promise resolves with.           |

**Returns:** a `Promise` that resolves with `data` after the delay.

**Use case:** faking the WooCommerce add-to-cart AJAX response in a story or test so the button's loading state can be checked, or waiting for a cart drawer's CSS transition before asserting.

**Examples:**

```js
await testWaitAsync( 500 );               // {} after ~500ms
await testWaitAsync( 500, { ok: true } ); // { ok: true }
await testWaitAsync( 0, 42 );             // 42 on the next timer tick
await testWaitAsync( -5, 'now' );         // 'now' (negative delay acts like 0)
```

```js
// Faking the add-to-cart AJAX response.
async function fakeAddToCart( productId, quantity = 1 ) {
  return testWaitAsync( 800, {
    fragments: { 'span.cart-count': `<span class="cart-count">${ quantity }</span>` },
    cart_hash: `hash-${ productId }`,
  } );
}

$button.classList.add( 'loading' );
const response = await fakeAddToCart( 42, 2 );
$button.classList.remove( 'loading' );
```

```js
// Testing a debounced product search with Jest fake timers.
it( 'shows results after the search delay', async () => {
  jest.useFakeTimers();

  const pending = testWaitAsync( 300, [ { id: 1, name: 'Hoodie' } ] );
  jest.advanceTimersByTime( 300 );

  expect( await pending ).toEqual( [ { id: 1, name: 'Hoodie' } ] );
  jest.useRealTimers();
} );
```

**Notes:**

- The delay is a minimum; timers can run late when the main thread is busy or the tab is in the background.
- Negative, `NaN` or missing `milliseconds` behave like `0`, but the promise still resolves after the current synchronous code.
- `data` is resolved by reference, not copied.
- Works with Jest fake timers: advance the clock, then `await` the promise.
- The promise never rejects and cannot be cancelled. Throw after it to test error paths.

---

## testWaitSync

Blocks the main thread for `milliseconds` with a busy-wait loop, then returns `data`. Nothing else runs while it waits: no rendering, input handling, timers or promise callbacks.

```js
testWaitSync( milliseconds, data = {} ): T
```

| Parameter      | Type     | Default | Description                              |
| -------------- | -------- | ------- | ---------------------------------------- |
| `milliseconds` | `number` | -       | Minimum time to block, in milliseconds.  |
| `data`         | `T`      | `{}`    | Value to return after the delay.         |

**Returns:** `data`, after the delay.

**Use case:** reproducing a slow synchronous task, such as an expensive product sort, in a Storybook story, or testing code that measures and reports how long work took.

**Examples:**

```js
testWaitSync( 50 );         // {} after blocking ~50ms
testWaitSync( 50, 'done' ); // 'done'
testWaitSync( 0, 'now' );   // 'now', without blocking
testWaitSync( -10, 'now' ); // 'now', without blocking
```

```js
// Testing a helper that warns about slow work.
function timed( label, fn, limit = 50 ) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if ( duration > limit ) {
    console.warn( `${ label } took ${ Math.round( duration ) }ms` );
  }

  return result;
}

it( 'warns about slow swatch rendering', () => {
  const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

  timed( 'Swatches', () => testWaitSync( 80, [] ) );

  expect( warn ).toHaveBeenCalled();
  warn.mockRestore();
} );
```

```js
// Reproducing a slow product sort in a Storybook story.
function sortProducts( products ) {
  testWaitSync( 300 ); // Simulate an expensive sort on a large catalogue.
  return [ ...products ].sort( ( a, b ) => a.price - b.price );
}
```

**Notes:**

- The page freezes and the CPU stays busy for the whole delay. Never use it in production code.
- Never use it with Jest fake timers: they freeze `Date.now()`, so the loop never ends and the test hangs. Use `testWaitAsync` with `jest.advanceTimersByTime()` instead.
- Negative, `0` or `NaN` values return immediately.
- DOM changes made before the call are not painted until it returns.
