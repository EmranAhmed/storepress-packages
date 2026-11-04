'use strict';

/**
 * Converts a camelCase, kebab-case, dotted or spaced string to CONSTANT_CASE.
 *
 * An underscore is inserted before an uppercase letter that follows a lowercase
 * letter or digit, each run of separators (`-`, `_`, `.`, `:`, `~` or whitespace)
 * becomes a single underscore, leading and trailing underscores are removed, and
 * the result is uppercased. Use it for constant names, action types and
 * lookup keys for status or message maps.
 *
 * Notes:
 * - Repeated separators are collapsed: `'foo--bar'` becomes `'FOO_BAR'`.
 * - Runs of capitals are not split, unlike the other converters:
 *   `'XMLHttpRequest'` becomes `'XMLHTTP_REQUEST'`, while `toSnakeCase` gives
 *   `'xml_http_request'`.
 * - Already-constant input is returned unchanged: `'HELLO_WORLD'` stays `'HELLO_WORLD'`.
 * - Other characters such as `+` or `/` are kept and uppercased: `'a+b'` becomes `'A+B'`.
 * - The input must be a string; `null` and numbers throw a `TypeError`.
 *
 * @param {string} string - Text to convert.
 * @return {string} The CONSTANT_CASE string.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * toConstantCase( 'addToCart' );        // 'ADD_TO_CART'
 * toConstantCase( 'out-of-stock' );     // 'OUT_OF_STOCK'
 * toConstantCase( 'cart.updated' );     // 'CART_UPDATED'
 * toConstantCase( 'free shipping' );    // 'FREE_SHIPPING'
 * toConstantCase( 'HELLO_WORLD' );      // 'HELLO_WORLD'
 * toConstantCase( 'item2Count' );       // 'ITEM2_COUNT'
 * toConstantCase( 'XMLHttpRequest' );   // 'XMLHTTP_REQUEST'
 * toConstantCase( 'foo--bar' );         // 'FOO_BAR'
 * toConstantCase( '-trimmed-' );        // 'TRIMMED'
 * toConstantCase( '' );                 // ''
 *
 * @example
 * // Real-life use case: an event-name constant map
 * // Gives autocomplete-friendly names for the plugin's custom events.
 * const EVENTS = Object.fromEntries(
 *   [ 'cart-updated', 'variation-changed', 'drawer-opened' ].map( ( name ) => [
 *     toConstantCase( name ),
 *     `storepress:${ name }`,
 *   ] )
 * );
 * // { CART_UPDATED: 'storepress:cart-updated', VARIATION_CHANGED: ..., DRAWER_OPENED: ... }
 *
 * @example
 * // Real-life use case: action types for a mini cart store
 * // `dispatch( 'removeItem', ... )` maps to the `REMOVE_ITEM` case.
 * function reducer( state, action ) {
 *   switch ( action.type ) {
 *     case 'ADD_ITEM':
 *       return { ...state, items: [ ...state.items, action.item ] };
 *     case 'REMOVE_ITEM':
 *       return { ...state, items: state.items.filter( ( item ) => item.key !== action.key ) };
 *     default:
 *       return state;
 *   }
 * }
 *
 * const dispatch = ( name, payload ) => {
 *   state = reducer( state, { type: toConstantCase( name ), ...payload } );
 * };
 *
 * @example
 * // Real-life use case: labelling WooCommerce order statuses on a My Account page
 * // Order statuses arrive as 'pending', 'processing', 'on-hold', 'completed', and so on.
 * const STATUS_LABELS = {
 *   PENDING: __( 'Awaiting payment', 'storepress' ),
 *   PROCESSING: __( 'Being prepared', 'storepress' ),
 *   ON_HOLD: __( 'On hold', 'storepress' ),
 *   COMPLETED: __( 'Delivered', 'storepress' ),
 * };
 *
 * const label = STATUS_LABELS[ toConstantCase( order.status ) ] ?? order.status;
 *
 * @see toSnakeCase
 *
 * @since 0.8.0
 */
export function toConstantCase(string) {
  return string
  // Insert underscores before uppercase letters (but not at start)
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  // Replace any separator characters with underscore
  .replace(/[-._:~\s]+/g, '_')
  // Remove leading/trailing underscores
  .replace(/^_+|_+$/g, '')
  // Convert the entire string to uppercase
  .toUpperCase();
}