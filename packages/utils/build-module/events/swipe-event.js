'use strict';

/**
 * Internal dependencies
 */
import { triggerEvent } from './trigger-event.js';

/**
 * Detects swipe gestures on an element and reports them as `swipe` events.
 *
 * Listens for touch events, and pointer (mouse and pen) events unless
 * `touchOnly` is set. While the finger or pointer moves, it dispatches a
 * non-bubbling `swipe` `CustomEvent` on the target with the distance moved and
 * the direction. When the gesture ends it dispatches one final `swipe` event with
 * `done: true`. `listenerFn` is registered for those events. Use it for mobile
 * product galleries, slide-out mini-cart drawers, dismissible notices, and
 * carousels.
 *
 * The `event.detail` object:
 *
 * | Property | Type    | Meaning                                                      |
 * | -------- | ------- | ------------------------------------------------------------ |
 * | `x`      | number  | Horizontal distance from the start point (negative = left)   |
 * | `y`      | number  | Vertical distance from the start point (negative = up)       |
 * | `left`   | boolean | Moved left more than `offset` pixels                         |
 * | `right`  | boolean | Moved right more than `offset` pixels                        |
 * | `top`    | boolean | Moved up more than `offset` pixels                           |
 * | `bottom` | boolean | Moved down more than `offset` pixels                         |
 * | `moving` | boolean | `true` while the gesture is in progress                      |
 * | `done`   | boolean | `true` once, on the final event when the gesture ends        |
 *
 * Notes:
 * - `target` must be a single element. A selector string throws a `TypeError`.
 * - A tap or click with no movement fires no `swipe` event at all.
 * - A diagonal gesture can set two flags, e.g. `left` and `bottom`. Compare
 *   `Math.abs( x )` and `Math.abs( y )` to pick the main direction.
 * - `offset` only controls the direction flags. `moving` events fire on every
 *   move, so throttle heavy work (or use `requestAnimationFrame`).
 * - With pointer events on, a mouse drag counts as a swipe. Use `touchOnly: true`
 *   when desktop users should select text or drag images instead.
 * - Touch listeners are passive, so the page can still scroll during a swipe.
 *   For a horizontal gallery, add `touch-action: pan-y` in CSS on the target.
 * - The `swipe` event is dispatched on `target`, so any other `swipe` listener on
 *   that element, including one from another `swipeEvent` call, receives it too.
 * - Always call the returned cleanup function when the component is destroyed.
 *   It removes every listener, including `listenerFn`.
 *
 * @param {Element}                        target                    - Element to watch for swipes.
 * @param {( event: CustomEvent ) => void} listenerFn                - Called for every `swipe` event. Read the gesture from `event.detail`.
 * @param {Object}                         [options={}]              - Options.
 * @param {number}                         [options.offset=10]       - Distance in pixels a gesture must pass before a direction flag becomes `true`.
 * @param {boolean}                        [options.touchOnly=false] - Listen to touch events only, and ignore mouse and pen.
 *
 * @return {() => void} Cleanup function that removes all listeners added by this call.
 *
 * @throws {TypeError} If `target` is not an element (for example a selector string).
 *
 * @example
 * // At a glance
 * const stop = swipeEvent( element, ( event ) => {
 *   console.log( event.detail );
 * } );
 * // Finger moves 40px left:
 * // { x: -40, y: 5, left: true, right: false, top: false, bottom: false, moving: true, done: false }
 * // Finger lifts after 60px:
 * // { x: -60, y: 4, left: true, right: false, top: false, bottom: false, moving: false, done: true }
 *
 * stop(); // Removes every listener
 *
 * @example
 * // Real-life use case: swipe between images in a mobile product gallery
 * const gallery = document.querySelector( '.woocommerce-product-gallery' );
 * const slides = gallery.querySelectorAll( '.woocommerce-product-gallery__image' );
 * let current = 0;
 *
 * const stopGallerySwipe = swipeEvent(
 *   gallery,
 *   ( { detail } ) => {
 *     if ( ! detail.done || Math.abs( detail.x ) < Math.abs( detail.y ) ) {
 *       return; // Wait for the end, ignore mostly-vertical gestures
 *     }
 *     if ( detail.left && current < slides.length - 1 ) {
 *       current++;
 *     } else if ( detail.right && current > 0 ) {
 *       current--;
 *     }
 *     slides[ current ].scrollIntoView( { behavior: 'smooth', inline: 'start', block: 'nearest' } );
 *   },
 *   { offset: 40, touchOnly: true }
 * );
 *
 * @example
 * // Real-life use case: drag the mini-cart drawer closed with live feedback
 * const drawer = document.querySelector( '.mini-cart-drawer' );
 *
 * swipeEvent( drawer, ( { detail } ) => {
 *   const distance = Math.max( 0, detail.x ); // Only follow rightward drags
 *
 *   if ( detail.moving ) {
 *     drawer.style.transform = `translateX( ${ distance }px )`;
 *     return;
 *   }
 *
 *   drawer.style.transform = '';
 *   if ( distance > drawer.offsetWidth / 3 ) {
 *     drawer.classList.remove( 'is-open' ); // Far enough: close
 *   } // Otherwise it snaps back
 * } );
 *
 * @example
 * // Real-life use case: swipe a store notice away on phones
 * document.querySelectorAll( '.woocommerce-message' ).forEach( ( notice ) => {
 *   const stop = swipeEvent(
 *     notice,
 *     ( { detail } ) => {
 *       if ( detail.done && ( detail.left || detail.right ) && Math.abs( detail.x ) > 80 ) {
 *         stop(); // Clean up before the element goes away
 *         notice.remove();
 *       }
 *     },
 *     { touchOnly: true }
 *   );
 * } );
 *
 * @example
 * // Real-life use case: plugin lifecycle with cleanup on destroy
 * class QuickViewSlider {
 *   constructor( $element ) {
 *     this.$element = $element;
 *     this.stopSwipe = swipeEvent( $element, this.onSwipe, { offset: 30 } );
 *   }
 *
 *   onSwipe = ( { detail } ) => {
 *     if ( detail.done && detail.left ) {
 *       this.next();
 *     }
 *     if ( detail.done && detail.right ) {
 *       this.previous();
 *     }
 *   };
 *
 *   destroy() {
 *     this.stopSwipe(); // Called when the quick view modal closes
 *   }
 * }
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events Touch events
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events Pointer events
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action touch-action
 */
export function swipeEvent(target, listenerFn, options = {}) {
  let readyToMove = false;
  let isMoved = false;
  let xStart = 0;
  let yStart = 0;
  let isTouchEvent = false;
  const defaults = {
    offset: 10,
    touchOnly: false
  };
  const settings = {
    ...defaults,
    ...options
  };
  const controller = new AbortController();
  const {
    signal
  } = controller;
  const start = event => {
    readyToMove = true;
    isMoved = false;
    xStart = event.x;
    yStart = event.y;
    isTouchEvent = event.type === 'touchstart';
    if (event.type === 'pointerdown' && isTouchEvent) {
      return false;
    }
    if (isTouchEvent) {
      const {
        clientX,
        clientY
      } = event.changedTouches[0];
      xStart = clientX;
      yStart = clientY;
    }
  };
  const move = event => {
    if (!readyToMove) {
      return;
    }
    if (event.type === 'pointermove' && isTouchEvent) {
      return false;
    }
    let horizontalDiff = event.x - xStart;
    let verticalDiff = event.y - yStart;
    if (isTouchEvent) {
      const touch = event.changedTouches[0];
      horizontalDiff = touch.clientX - xStart;
      verticalDiff = touch.clientY - yStart;
    }
    isMoved = true;
    const details = {
      x: horizontalDiff,
      y: verticalDiff,
      top: verticalDiff + settings.offset < 0,
      // to top
      bottom: verticalDiff - settings.offset > 0,
      // to bottom
      left: horizontalDiff + settings.offset < 0,
      // to left
      right: horizontalDiff - settings.offset > 0,
      // to right
      moving: true,
      done: false
    };
    triggerEvent(target, 'swipe', details);
  };
  const end = event => {
    if (!readyToMove) {
      return;
    }
    const isPointerEvent = event.type === 'pointerleave' || event.type === 'pointerup';
    if (isPointerEvent && isTouchEvent) {
      return false;
    }
    let horizontalDiff = event.x - xStart;
    let verticalDiff = event.y - yStart;
    if (isTouchEvent) {
      const {
        clientX,
        clientY
      } = event.changedTouches[0];
      horizontalDiff = clientX - xStart;
      verticalDiff = clientY - yStart;
    }
    if (isMoved) {
      const details = {
        x: horizontalDiff,
        y: verticalDiff,
        top: verticalDiff + settings.offset < 0,
        // to top
        bottom: verticalDiff - settings.offset > 0,
        // to bottom
        left: horizontalDiff + settings.offset < 0,
        // to left
        right: horizontalDiff - settings.offset > 0,
        // to right
        moving: false,
        done: true
      };
      triggerEvent(target, 'swipe', details);
    }
    isMoved = false;
    isTouchEvent = false;
    readyToMove = false;
  };
  const unregister = () => {
    controller.abort();
  };
  const register = () => {
    target.addEventListener('touchstart', start, {
      passive: true,
      signal
    });
    target.addEventListener('touchmove', move, {
      passive: true,
      signal
    });
    target.addEventListener('touchend', end, {
      passive: true,
      signal
    });
    target.addEventListener('touchcancel', end, {
      signal
    });
    if (!settings.touchOnly) {
      target.addEventListener('pointerdown', start, {
        signal
      });
      target.addEventListener('pointermove', move, {
        signal
      });
      target.addEventListener('pointerup', end, {
        signal
      });
      target.addEventListener('pointerleave', end, {
        signal
      });
    }
    target.addEventListener('swipe', listenerFn, {
      signal
    });
    return unregister;
  };
  return register();
}