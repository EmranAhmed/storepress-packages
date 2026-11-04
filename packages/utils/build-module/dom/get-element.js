'use strict';

/**
 * Resolves a selector or element to a single `HTMLElement`, `document`, or `null`.
 *
 * Library functions often accept a target as either a CSS selector or an element
 * the caller already has. `getElement` turns both into one element, so the
 * function body only has to handle an element or `null`. Use it when exactly one
 * target is expected, such as a modal, a mini-cart, or a checkout form. Use
 * `getElements()` when the target can match several elements.
 *
 * How each input is resolved:
 *
 * | Input                                             | Result                                            |
 * | ------------------------------------------------- | ------------------------------------------------- |
 * | CSS selector string                               | `document.querySelector()`: first match or `null` |
 * | `HTMLElement` (including `<form>`, `<select>`)    | The same element                                  |
 * | `document`                                        | `document`                                        |
 * | `null` or `undefined`                             | `null`                                            |
 * | SVG element, element from another frame           | `null`                                            |
 * | `window`, NodeList, array, number, object         | `null`                                            |
 * | Empty, blank or invalid selector (`''`, `'div['`) | Throws `SyntaxError`                              |
 *
 * Notes:
 * - Selector strings are passed to `document.querySelector()` unchanged, so an
 *   empty, whitespace-only or invalid selector throws a `SyntaxError`. Check
 *   user-provided selectors before passing them. `getElements()` returns `[]`
 *   for these instead.
 * - Elements are checked with `instanceof HTMLElement`. SVG elements and
 *   elements created in another frame or window return `null`, while
 *   `getElements()` accepts them.
 * - Selectors are always queried against `document`. To search inside a
 *   container, pass `container.querySelector( '...' )` instead of a string.
 * - Only the first match is returned. Use `getElements()` for all matches.
 *
 * @param {string|HTMLElement|Document|null} [selector=null] - A CSS selector, an element, or `document`.
 *
 * @return {HTMLElement|Document|null} The resolved element, `document`, or `null` when nothing matches or the input is not supported.
 *
 * @throws {SyntaxError} When `selector` is an empty, blank or invalid CSS selector string.
 *
 * @example
 * // At a glance
 * getElement( '#add-to-cart' );             // <button id="add-to-cart">
 * getElement( '.product-gallery' );         // first .product-gallery element
 * getElement( '.missing' );                 // null
 * getElement( $button ) === $button;        // true
 * getElement( document.forms[ 0 ] );        // <form> (not its controls)
 * getElement( document );                   // document
 * getElement();                             // null
 * getElement( null );                       // null
 * getElement( document.querySelector( 'svg' ) ); // null (not an HTMLElement)
 * getElement( window );                     // null
 * getElement( document.querySelectorAll( '.btn' ) ); // null (use getElements)
 * getElement( '' );                         // throws SyntaxError
 * getElement( 'div[' );                     // throws SyntaxError
 *
 * @example
 * // Real-life use case: a component that accepts a selector or an element
 * // The mini-cart can be created from PHP-printed markup or from JavaScript.
 * class MiniCart {
 *   constructor( target, options = {} ) {
 *     this.$element = getElement( target );
 *
 *     if ( ! this.$element ) {
 *       throw new Error( 'MiniCart: target element not found.' );
 *     }
 *
 *     this.options = options;
 *   }
 * }
 *
 * new MiniCart( '#site-header-cart' );
 * new MiniCart( document.querySelector( '.widget_shopping_cart' ) );
 *
 * @example
 * // Real-life use case: updating the cart count after an AJAX add to cart
 * // WooCommerce fires `added_to_cart` with the new cart fragments.
 * function updateCartCount( target, count ) {
 *   const $count = getElement( target );
 *
 *   if ( ! $count ) {
 *     return false;
 *   }
 *
 *   $count.textContent = String( count );
 *   $count.classList.toggle( 'is-empty', count === 0 );
 *   return true;
 * }
 *
 * updateCartCount( '.cart-contents .count', 3 );
 *
 * @example
 * // Real-life use case: guarding a user-provided selector
 * // Plugin settings can hold any text, and an invalid selector throws.
 * function findSafe( selector ) {
 *   if ( typeof selector === 'string' && ! selector.trim() ) {
 *     return null;
 *   }
 *
 *   try {
 *     return getElement( selector );
 *   } catch {
 *     console.warn( `Invalid selector: ${ selector }` );
 *     return null;
 *   }
 * }
 *
 * findSafe( settings.stickyHeaderSelector ); // element, or null
 *
 * @example
 * // Real-life use case: validating a checkout field
 * // Mark the billing email invalid before the order is submitted.
 * function validateField( target, isValid ) {
 *   const $field = getElement( target );
 *
 *   if ( ! $field ) {
 *     return true; // Field not on this page: nothing to validate.
 *   }
 *
 *   const valid = isValid( $field.value.trim() );
 *   $field.closest( '.form-row' )?.classList.toggle( 'woocommerce-invalid', ! valid );
 *   $field.setAttribute( 'aria-invalid', String( ! valid ) );
 *   return valid;
 * }
 *
 * validateField( '#billing_email', ( value ) => value.includes( '@' ) );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector Document.querySelector()
 * @see getElements
 *
 * @since 0.3.0
 */
export function getElement(selector = null) {
  if (null === selector) {
    return null;
  }
  if (document === selector) {
    return document;
  }
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return selector instanceof HTMLElement ? selector : null;
}