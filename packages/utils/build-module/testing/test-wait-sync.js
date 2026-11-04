'use strict';

/**
 * Blocks the main thread for `milliseconds`, then returns `data`.
 *
 * It runs a busy-wait loop that checks `Date.now()` until the time has passed.
 * Nothing else runs while it waits: no rendering, no input handling, no timers,
 * no promise callbacks. Use it to simulate slow synchronous work in tests and
 * demos, for example to check that a loading state appears before heavy code
 * runs, to reproduce a long task in the Performance panel, or to test code that
 * measures how long something took.
 *
 * Notes:
 * - The page freezes and the CPU stays busy for the whole delay. Never use it in
 *   production code.
 * - Never use it with Jest fake timers: they freeze `Date.now()`, so the loop
 *   never ends and the test hangs. Use `testWaitAsync()` with
 *   `jest.advanceTimersByTime()` instead.
 * - The delay is a minimum: it returns once at least `milliseconds` have passed.
 * - Negative, `0` or `NaN` values return immediately.
 * - `data` is returned by reference, not copied. Without `data`, each call
 *   returns a new empty object.
 * - DOM changes made before the call are not painted until it returns.
 *
 * @template T
 *
 * @param {number} milliseconds - Minimum time to block, in milliseconds.
 * @param {T}      [data={}]    - Value to return after the delay.
 *
 * @return {T} `data`, after the delay.
 *
 * @example
 * // At a glance
 * testWaitSync( 50 );                        // {} after blocking ~50ms
 * testWaitSync( 50, 'done' );                // 'done'
 * testWaitSync( 50, { id: 7 } );             // { id: 7 }
 * testWaitSync( 0, 'now' );                  // 'now', without blocking
 * testWaitSync( -10, 'now' );                // 'now', without blocking
 *
 * const start = Date.now();
 * testWaitSync( 100 );
 * Date.now() - start >= 100;                 // true
 *
 * @example
 * // Real-life use case: testing code that measures slow work
 * // A helper that warns when building variation swatches takes too long.
 * function timed( label, fn, limit = 50 ) {
 *   const start = performance.now();
 *   const result = fn();
 *   const duration = performance.now() - start;
 *
 *   if ( duration > limit ) {
 *     console.warn( `${ label } took ${ Math.round( duration ) }ms` );
 *   }
 *
 *   return result;
 * }
 *
 * it( 'warns about slow swatch rendering', () => {
 *   const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
 *
 *   timed( 'Swatches', () => testWaitSync( 80, [] ) );
 *
 *   expect( warn ).toHaveBeenCalled();
 *   warn.mockRestore();
 * } );
 *
 * @example
 * // Real-life use case: reproducing a long task in a Storybook story
 * // Shows how the product filter feels when its sorting code is slow.
 * function sortProducts( products ) {
 *   testWaitSync( 300 ); // Simulate an expensive sort on a large catalogue.
 *   return [ ...products ].sort( ( a, b ) => a.price - b.price );
 * }
 *
 * $sortSelect.addEventListener( 'change', () => {
 *   renderProducts( sortProducts( products ) ); // The page freezes for 300ms.
 * } );
 *
 * @example
 * // Real-life use case: checking that a loading state is shown before heavy work
 * // Yield one frame so the spinner is painted, then run the blocking work.
 * function recalculateCart( $cart ) {
 *   $cart.classList.add( 'is-loading' );
 *
 *   requestAnimationFrame( () => {
 *     setTimeout( () => {
 *       testWaitSync( 500 ); // Stand-in for a slow synchronous recalculation.
 *       $cart.classList.remove( 'is-loading' );
 *     }, 0 );
 *   } );
 * }
 *
 * @see testWaitAsync
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Main_thread Main thread
 */
export function testWaitSync(milliseconds, data = {}) {
  const start = Date.now();
  while (Date.now() - start < milliseconds) {}
  return data;
}