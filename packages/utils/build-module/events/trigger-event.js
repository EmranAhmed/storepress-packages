'use strict';

/**
 * Internal dependencies
 */
import { getElements } from '../dom/get-elements.js';

/**
 * Dispatches a `CustomEvent` with data on one or more targets.
 *
 * A small wrapper around `new CustomEvent()` and `dispatchEvent()`. It accepts the
 * same target forms as `getElements` (selector, element, list, `document`,
 * `window`), applies safe defaults, and puts your data in `event.detail`. Use it
 * to let parts of a plugin, or third-party code, react to things your code
 * does: a cart update, a slide change, a modal opening.
 *
 * Notes:
 * - Returns nothing. To let listeners cancel an action, dispatch with
 *   `dispatchEvent()` yourself and read its return value, or pass a mutable
 *   object in `eventDetails` that listeners can change.
 * - `eventDetails` is shallow-copied into `event.detail`. Nested objects are still
 *   shared, so a listener that changes `detail.product.price` changes your object.
 * - `eventDetails` is spread into an object: an array becomes `{ 0: ..., 1: ... }`.
 *   Wrap arrays, e.g. `{ items: [ ... ] }`.
 * - Events don't bubble by default. Pass `{ bubbles: true }` to listen on a parent
 *   or on `document`.
 * - A selector that matches nothing, or an invalid selector, dispatches nothing
 *   and does not throw.
 * - Always dispatches a `CustomEvent`, even for native names like `'click'`.
 *   Native default actions (following a link, submitting a form) do not run.
 *
 * @param {string|Element|Document|Window|ArrayLike<Element>} $targets                  - Target(s) to dispatch on. Resolved with `getElements`.
 * @param {string}                                            eventType                 - Event name, e.g. `'storepress:cart:updated'`.
 * @param {Object}                                            [eventDetails={}]         - Data copied into `event.detail`.
 * @param {Object}                                            [options={}]              - CustomEvent options.
 * @param {boolean}                                           [options.bubbles=false]   - Whether the event bubbles up the DOM tree.
 * @param {boolean}                                           [options.cancelable=true] - Whether `event.preventDefault()` marks the event as canceled.
 * @param {boolean}                                           [options.composed=false]  - Whether the event crosses a shadow DOM boundary.
 *
 * @return {void}
 *
 * @example
 * // At a glance
 * triggerEvent( '#mini-cart', 'cart:opened' );                 // detail: {}
 * triggerEvent( button, 'quantity:changed', { quantity: 3 } ); // detail: { quantity: 3 }
 * triggerEvent( '.product', 'product:seen', {}, { bubbles: true } ); // one event per .product
 * triggerEvent( document, 'store:ready' );                      // global event
 * triggerEvent( '.missing', 'noop' );                           // nothing happens, no error
 *
 * @example
 * // Real-life use case: tell other scripts the cart changed after AJAX add-to-cart
 * async function addToCart( productId, quantity ) {
 *   const response = await fetch( '/?wc-ajax=add_to_cart', {
 *     method: 'POST',
 *     body: new URLSearchParams( { product_id: productId, quantity } ),
 *   } );
 *   const data = await response.json();
 *
 *   triggerEvent( document.body, 'storepress:cart:updated', {
 *     productId,
 *     quantity,
 *     fragments: data.fragments,
 *   } );
 * }
 *
 * // Mini-cart badge, header total, analytics: each listens on its own.
 * document.body.addEventListener( 'storepress:cart:updated', ( event ) => {
 *   document.querySelector( '.cart-count' ).textContent = event.detail.quantity;
 * } );
 *
 * @example
 * // Real-life use case: bubbling event from a product card, handled once on the grid
 * // Each card fires the event; one listener on the grid handles every card.
 * document.querySelectorAll( '.product-card .quick-view' ).forEach( ( button ) => {
 *   button.addEventListener( 'click', () => {
 *     triggerEvent(
 *       button,
 *       'storepress:quick-view:request',
 *       { productId: Number( button.dataset.productId ) },
 *       { bubbles: true }
 *     );
 *   } );
 * } );
 *
 * document.querySelector( '.products' ).addEventListener( 'storepress:quick-view:request', ( event ) => {
 *   openQuickView( event.detail.productId );
 * } );
 *
 * @example
 * // Real-life use case: announce a variation change to add-ons and price widgets
 * const form = document.querySelector( '.variations_form' );
 *
 * form.addEventListener( 'change', () => {
 *   const variation = findMatchingVariation( form ); // your lookup
 *
 *   triggerEvent( form, 'storepress:variation:changed', {
 *     variationId: variation?.variation_id ?? 0,
 *     price: variation?.display_price ?? null,
 *     inStock: variation?.is_in_stock ?? false,
 *   } );
 * } );
 *
 * @example
 * // Real-life use case: an event from inside a web component's shadow DOM
 * // `composed: true` lets the event leave the shadow root so page scripts can hear it.
 * class StoreRating extends HTMLElement {
 *   select( stars ) {
 *     triggerEvent( this, 'storepress:rating:selected', { stars }, { bubbles: true, composed: true } );
 *   }
 * }
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent CustomEvent()
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent EventTarget.dispatchEvent()
 */
export function triggerEvent($targets, eventType, eventDetails = {}, options = {}) {
  const defaultOptions = {
    bubbles: false,
    cancelable: true,
    composed: false
  };
  const availableOptions = {
    ...defaultOptions,
    ...options
  };
  const $elements = getElements($targets);
  $elements.forEach($element => {
    return $element.dispatchEvent(new CustomEvent(eventType, {
      ...availableOptions,
      detail: {
        ...eventDetails
      }
    }));
  });
}