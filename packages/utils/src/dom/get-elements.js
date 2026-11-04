'use strict';
/**
 * Normalizes any "target" input into a plain, static array of DOM targets.
 *
 * Library functions often let callers say *which* elements to act on in whatever
 * form is most convenient: a CSS selector, a single element, a NodeList, an array,
 * or `document`/`window` for global behaviour. `getElements` turns all of those
 * into the same thing: a new `Array`, so callers can always use `forEach`, `map`,
 * `filter`, and so on without checking the input type first.
 *
 * How each input is resolved:
 *
 * | Input                                    | Result                                        |
 * | ---------------------------------------- | --------------------------------------------- |
 * | CSS selector string                      | `Array.from( document.querySelectorAll() )`   |
 * | Element (HTML, SVG, or from an iframe)   | `[ element ]`                                 |
 * | `document` or `window`                   | `[ document ]` / `[ window ]`                 |
 * | Array, NodeList, HTMLCollection          | New array; `null`/`undefined` entries removed |
 * | `undefined`, `null`, `''`, `'   '`       | `[]`                                          |
 * | Invalid selector (e.g. `'div['`)         | `[]` (the `SyntaxError` is swallowed)         |
 * | Anything else (number, plain object)     | `[]`                                          |
 *
 * Notes:
 * - The result is always a **new, static array**. It never returns the caller's own
 *   array or a live `HTMLCollection`, so changing the result never affects the input,
 *   and later DOM changes never affect the result.
 * - Elements are detected with `nodeType`, not `instanceof HTMLElement`. That means
 *   SVG elements and elements from other frames work, and elements that have their
 *   own `length` property (`<form>`, `<select>`) are wrapped, not iterated.
 * - Selectors are always queried against `document`. To search inside a container,
 *   pass `container.querySelectorAll( '...' )` instead of a string.
 * - Invalid selectors return `[]` instead of throwing, so a typo fails silently.
 *   If no elements are found, check the selector first.
 * - The result holds strong references to the elements. If you keep it in a
 *   long-lived object, release it when the elements are removed so they can be
 *   garbage collected.
 *
 * @param {string|Element|Document|Window|ArrayLike<Element>|null} [selectors=[]] - A CSS selector, a single target, or a list of targets.
 * @return {Array<Element|Document|Window>} A new array of resolved targets; empty when nothing matches.
 *
 * @example
 * // Accepted inputs at a glance
 * getElements( '.card' );                           // [ div.card, div.card, ... ]
 * getElements( document.querySelector( 'svg' ) );   // [ svg ]
 * getElements( document.forms[ 0 ] );               // [ form ] (not its controls)
 * getElements( document.querySelectorAll( 'li' ) ); // [ li, li, ... ] as an Array
 * getElements( [ header, null, footer ] );          // [ header, footer ]
 * getElements( window );                            // [ window ]
 * getElements( null );                              // []
 * getElements( 'div[' );                            // [] (invalid selector)
 *
 * @example
 * // Real-life use case: an event helper that accepts any target
 * // `bindAll` works for one button, a selector, or `window` without type checks.
 * function bindAll( targets, type, handler, options ) {
 *   const elements = getElements( targets );
 *
 *   elements.forEach( ( element ) => element.addEventListener( type, handler, options ) );
 *
 *   // Return a cleanup function so listeners don't outlive the component.
 *   return () => {
 *     elements.forEach( ( element ) => element.removeEventListener( type, handler, options ) );
 *   };
 * }
 *
 * const unbindClicks = bindAll( '.add-to-cart', 'click', onAddToCart );
 * const unbindResize = bindAll( window, 'resize', onResize, { passive: true } );
 *
 * // Later, e.g. when the component is destroyed:
 * unbindClicks();
 * unbindResize();
 *
 * @example
 * // Real-life use case: initializing a plugin on every matching element
 * // Markup: <div class="product-gallery" data-autoplay="true">...</div>
 * const instances = new WeakMap();
 *
 * function initGallery( targets, options = {} ) {
 *   return getElements( targets )
 *     .filter( ( element ) => ! instances.has( element ) ) // skip already-initialized
 *     .map( ( element ) => {
 *       const gallery = new Gallery( element, options );
 *       instances.set( element, gallery ); // WeakMap: no leak when element is removed
 *       return gallery;
 *     } );
 * }
 *
 * initGallery( '.product-gallery' ); // on page load
 * initGallery( ajaxResponseContainer.querySelectorAll( '.product-gallery' ) ); // after AJAX
 *
 * @example
 * // Real-life use case: toggling the state of a group of form fields
 * // Disable shipping fields when "Same as billing address" is checked.
 * const sameAsBilling = document.querySelector( '#same-as-billing' );
 *
 * sameAsBilling.addEventListener( 'change', () => {
 *   getElements( '#shipping-address input, #shipping-address select' ).forEach( ( field ) => {
 *     field.disabled = sameAsBilling.checked;
 *     field.closest( '.form-row' )?.classList.toggle( 'is-disabled', sameAsBilling.checked );
 *   } );
 * } );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll Document.querySelectorAll()
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType Node.nodeType
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from Array.from()
 *
 * @since 0.3.0
 */
export function getElements( selectors = [] ) {
	if ( ! selectors ) {
		return [];
	}

	if ( typeof selectors === 'string' ) {
		const selector = selectors.trim();
		if ( ! selector ) {
			return [];
		}
		try {
			return Array.from( document.querySelectorAll( selector ) );
		} catch {
			return [];
		}
	}

	// Element (HTML, SVG, cross-realm) or Document. Checked before `length`
	// because <form> and <select> have their own `length` property.
	if ( selectors.nodeType === 1 || selectors.nodeType === 9 ) {
		return [ selectors ];
	}

	// Window. Checked before `length` because `window.length` is the iframe count.
	if ( selectors.window === selectors ) {
		return [ selectors ];
	}

	// Array, NodeList, HTMLCollection → static array snapshot without empty entries.
	if ( typeof selectors.length === 'number' ) {
		return Array.from( selectors ).filter(
			( item ) => item !== null && item !== undefined
		);
	}

	return [];
}
