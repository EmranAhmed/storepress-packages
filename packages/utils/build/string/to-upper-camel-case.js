'use strict';

/**
 * Converts a separated or camelCase string to UpperCamelCase (PascalCase).
 *
 * The input is split into words at separators (`-`, `_`, `.`, `:`, `~` or
 * whitespace) and at case changes (`addToCart`, `XMLHttpRequest`). Each word is
 * capitalized and the words are joined. StorePress uses it to turn plugin namespaces into keys on the global
 * `window.StorePress` object, so `'product-gallery'` is stored as `ProductGallery`.
 *
 * Notes:
 * - The single word `'storepress'`, in any letter case, returns the brand spelling
 *   `'StorePress'`. This only applies to the whole string: `'storepress-tabs'`
 *   becomes `'StorepressTabs'`.
 * - Every word is lowercased before it is capitalized, so all-caps input works:
 *   `'HELLO_WORLD'` becomes `'HelloWorld'`.
 * - Acronyms become one word: `'XMLHttpRequest'` becomes `'XmlHttpRequest'`.
 * - Repeated, leading and trailing separators and whitespace are ignored:
 *   `'foo--bar'` and `'  foo bar  '` both become `'FooBar'`.
 * - Other characters such as `+` or `/` are kept as-is.
 * - The input must be a string; `null` and numbers throw a `TypeError`.
 *
 * @param {string} string - Text to convert.
 * @return {string} The UpperCamelCase string.
 * @throws {TypeError} If `string` is not a string.
 *
 * @example
 * // At a glance
 * toUpperCamelCase( 'product-gallery' );    // 'ProductGallery'
 * toUpperCamelCase( 'variation_swatches' ); // 'VariationSwatches'
 * toUpperCamelCase( 'cart drawer' );        // 'CartDrawer'
 * toUpperCamelCase( 'addToCart' );          // 'AddToCart'
 * toUpperCamelCase( 'storepress' );         // 'StorePress'
 * toUpperCamelCase( 'STOREPRESS' );         // 'StorePress'
 * toUpperCamelCase( 'storepress-tabs' );    // 'StorepressTabs'
 * toUpperCamelCase( 'HELLO_WORLD' );        // 'HelloWorld'
 * toUpperCamelCase( 'XMLHttpRequest' );     // 'XmlHttpRequest'
 * toUpperCamelCase( '  --foo--bar--  ' );   // 'FooBar'
 * toUpperCamelCase( '' );                   // ''
 *
 * @example
 * // Real-life use case: finding a plugin on the global StorePress object
 * // Plugins register under `window.StorePress.<UpperCamelCase namespace>`.
 * function getPluginApi( namespace ) {
 *   return window.StorePress?.[ toUpperCamelCase( namespace ) ];
 * }
 *
 * getPluginApi( 'product-gallery' ); // window.StorePress.ProductGallery
 *
 * @example
 * // Real-life use case: mounting components named in the markup
 * // Markup: <div data-component="cart-drawer"></div>
 * const components = { CartDrawer, MiniCart, VariationSwatches };
 *
 * document.querySelectorAll( '[data-component]' ).forEach( ( $element ) => {
 *   const Component = components[ toUpperCamelCase( $element.dataset.component ) ];
 *   if ( Component ) {
 *     new Component( $element );
 *   }
 * } );
 *
 * @example
 * // Real-life use case: routing WooCommerce events to handler methods
 * // `show_variation` calls `onShowVariation`, `reset_data` calls `onResetData`.
 * class VariationForm {
 *   handleEvent( event ) {
 *     const method = `on${ toUpperCamelCase( event.type ) }`;
 *     this[ method ]?.( event );
 *   }
 *
 *   onShowVariation( event ) {}
 *
 *   onResetData( event ) {}
 * }
 *
 * @see toCamelCase
 *
 * @since 0.3.0
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toUpperCamelCase = toUpperCamelCase;
function toUpperCamelCase(string) {
  if (string.toLowerCase() === 'storepress') {
    return 'StorePress';
  }
  return string
  // Split an acronym from the next word: "XMLHttp" → "XML Http".
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  // Split camelCase boundaries: "addToCart" → "add To Cart".
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  // Split on separators; drop empty parts from repeated, leading or trailing ones.
  .split(/[-._:~\s]+/).filter(Boolean).map(word => {
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}