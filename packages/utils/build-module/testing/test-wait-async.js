'use strict';

/**
 * Returns a promise that resolves with `data` after `milliseconds`, without blocking.
 *
 * Use it in tests, Storybook stories and demos to stand in for slow work, such as
 * an AJAX request, a WooCommerce cart fragment refresh or a CSS transition. The
 * delay uses `setTimeout`, so the page stays responsive while waiting, and the
 * promise resolves with whatever you pass as `data`, which makes it easy to fake
 * a response.
 *
 * Notes:
 * - The delay is a minimum, not an exact time. Timers can run late when the
 *   main thread is busy or the tab is in the background.
 * - Negative, `NaN` or missing `milliseconds` behave like `0`: the promise
 *   resolves on the next timer tick, still after the current synchronous code.
 * - `data` is resolved by reference, not copied. Without `data`, each call
 *   resolves with a new empty object.
 * - Works with Jest fake timers: call `jest.advanceTimersByTime( ms )` (or
 *   `jest.runAllTimers()`) and then `await` the promise.
 * - The promise never rejects and cannot be cancelled. To test error paths,
 *   chain a `throw` after it.
 * - Meant for tests and demos, not for production timing logic.
 *
 * @template T
 *
 * @param {number} milliseconds - Minimum delay before the promise resolves.
 * @param {T}      [data={}]    - Value the promise resolves with.
 *
 * @return {Promise<T>} A promise that resolves with `data` after the delay.
 *
 * @example
 * // At a glance
 * await testWaitAsync( 500 );                  // {} after ~500ms
 * await testWaitAsync( 500, { ok: true } );    // { ok: true }
 * await testWaitAsync( 0, 42 );                // 42 on the next timer tick
 * await testWaitAsync( -5, 'now' );            // 'now' (negative delay acts like 0)
 *
 * const order = [];
 * testWaitAsync( 0 ).then( () => order.push( 'async' ) );
 * order.push( 'sync' );
 * await testWaitAsync( 10 );
 * order; // [ 'sync', 'async' ]
 *
 * @example
 * // Real-life use case: faking the WooCommerce add-to-cart AJAX response
 * // Lets a Storybook story or a test show the loading state on the button.
 * async function fakeAddToCart( productId, quantity = 1 ) {
 *   return testWaitAsync( 800, {
 *     fragments: { 'span.cart-count': `<span class="cart-count">${ quantity }</span>` },
 *     cart_hash: `hash-${ productId }`,
 *   } );
 * }
 *
 * $button.classList.add( 'loading' );
 * const response = await fakeAddToCart( 42, 2 );
 * $button.classList.remove( 'loading' );
 * response.cart_hash; // 'hash-42'
 *
 * @example
 * // Real-life use case: testing a debounced product search with Jest fake timers
 * // Advance the clock instead of really waiting.
 * it( 'shows results after the search delay', async () => {
 *   jest.useFakeTimers();
 *
 *   const pending = testWaitAsync( 300, [ { id: 1, name: 'Hoodie' } ] );
 *   jest.advanceTimersByTime( 300 );
 *
 *   expect( await pending ).toEqual( [ { id: 1, name: 'Hoodie' } ] );
 *   jest.useRealTimers();
 * } );
 *
 * @example
 * // Real-life use case: waiting for a cart drawer transition in a test
 * // The drawer removes its "is-opening" class after a 250ms CSS transition.
 * it( 'opens the cart drawer', async () => {
 *   drawer.open();
 *   expect( $drawer.classList.contains( 'is-opening' ) ).toBe( true );
 *
 *   await testWaitAsync( 300 ); // Transition time plus a margin.
 *
 *   expect( $drawer.classList.contains( 'is-open' ) ).toBe( true );
 * } );
 *
 * @example
 * // Real-life use case: faking a failed request
 * // The promise never rejects, so throw after it to test error handling.
 * async function fakeApplyCoupon( code ) {
 *   await testWaitAsync( 400 );
 *
 *   if ( code !== 'SAVE10' ) {
 *     throw new Error( 'Coupon "' + code + '" does not exist.' );
 *   }
 *
 *   return { discount: 10 };
 * }
 *
 * await fakeApplyCoupon( 'SAVE10' ); // { discount: 10 }
 * await fakeApplyCoupon( 'WRONG' );  // rejects with an Error
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout setTimeout()
 * @see testWaitSync
 */
export function testWaitAsync(milliseconds, data = {}) {
  return new Promise(resolve => setTimeout(() => resolve(data), milliseconds));
}