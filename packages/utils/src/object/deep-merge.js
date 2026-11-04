'use strict';
/**
 * Internal dependencies
 */
import { isPlainObject } from './is-plain-object.js';

/**
 * Copies a value for the merged result so the result never shares plain
 * objects or arrays with a source.
 *
 * - Plain objects and arrays are copied deeply.
 * - Every other value (RegExp, Date, Map, DOM elements, functions, class
 *   instances, primitives) is returned as-is.
 * - A reference back to an object that is still being copied (a circular
 *   reference) points to that object's copy, so cycles are preserved without
 *   ever linking the result to a source.
 *
 * @private
 *
 * @param {*}            value  - Value to copy.
 * @param {Map<any,any>} copies - Objects currently being copied => their copies.
 *
 * @return {*} The copy, or the value itself when it is not a plain object or array.
 *
 * @example
 * // Arrays and plain objects are copied deeply
 * const source = { list: [ { a: 1 } ] };
 * const copy = cloneMergeValue( source.list, new Map() );
 * copy[ 0 ] === source.list[ 0 ]; // false
 *
 * @example
 * // Other values are returned as-is
 * const pattern = /^\d+$/;
 * cloneMergeValue( pattern, new Map() ) === pattern; // true
 * cloneMergeValue( 'blue', new Map() );               // 'blue'
 */
function cloneMergeValue( value, copies ) {
	if ( copies.has( value ) ) {
		return copies.get( value );
	}

	if ( Array.isArray( value ) ) {
		const copy = new Array( value.length );
		copies.set( value, copy );
		value.forEach( ( item, index ) => {
			copy[ index ] = cloneMergeValue( item, copies );
		} );
		copies.delete( value );
		return copy;
	}

	if ( isPlainObject( value ) ) {
		const copy =
			Object.getPrototypeOf( value ) === null ? Object.create( null ) : {};
		return mergeInto( copy, value, copies );
	}

	return value;
}

/**
 * Merges one plain-object source into a target that the merge owns (the
 * result or one of its copies), so the target can be modified safely.
 *
 * @private
 *
 * @param {Object}       target - Object owned by the merge result.
 * @param {Object}       source - Plain object to merge in.
 * @param {Map<any,any>} copies - Objects currently being copied => their copies.
 *
 * @return {Object} The target.
 *
 * @example
 * // Nested plain objects are merged into the existing target object
 * mergeInto( { a: { x: 1 } }, { a: { y: 2 } }, new Map() );
 * // { a: { x: 1, y: 2 } }
 *
 * @example
 * // undefined values and "__proto__" keys are skipped
 * const source = JSON.parse( '{"__proto__":{"admin":true},"b":2}' );
 * source.c = undefined;
 * mergeInto( { b: 1, c: 3 }, source, new Map() );
 * // { b: 2, c: 3 }
 */
function mergeInto( target, source, copies ) {
	copies.set( source, target );

	for ( const key of Object.keys( source ) ) {
		const value = source[ key ];

		// "__proto__" would replace the target's prototype; undefined means "not set".
		if ( key === '__proto__' || value === undefined ) {
			continue;
		}

		// Circular reference: point to the copy that is being built.
		if ( copies.has( value ) ) {
			target[ key ] = copies.get( value );
			continue;
		}

		const existing = Object.hasOwn( target, key ) ? target[ key ] : undefined;

		if ( isPlainObject( value ) && isPlainObject( existing ) ) {
			mergeInto( existing, value, copies );
		} else {
			target[ key ] = cloneMergeValue( value, copies );
		}
	}

	copies.delete( source );

	return target;
}

/**
 * Deeply merges plain objects into a new object. Later sources win.
 *
 * This is the standard way to build final settings from layers: plugin
 * defaults first, then options passed from JavaScript, then options read from
 * HTML (`data-*` attributes). Nested option groups are merged key by key, so
 * a source only has to contain the keys it wants to change. The sources are
 * never modified and the result shares no plain objects or arrays with them,
 * so the result is safe to change at runtime.
 *
 * | Value in a later source              | What happens to the result                       |
 * | ------------------------------------ | ------------------------------------------------ |
 * | Plain object (and earlier is too)    | Merged recursively                               |
 * | Plain object (earlier is not)        | Copied deeply, replaces the earlier value        |
 * | Array                                | Copied deeply, replaces the earlier value        |
 * | `undefined`                          | Skipped; the earlier value is kept               |
 * | `null`                               | Replaces the earlier value                       |
 * | RegExp, Date, Map, Set, element, function, class instance | Replaces the earlier value, same reference |
 * | Primitive (string, number, boolean)  | Replaces the earlier value                       |
 *
 * Notes:
 * - Put the defaults first and the most specific source last.
 * - Use `null` to clear a value on purpose. `undefined` means "not set", so an
 *   unset option never erases a default.
 * - Arrays are replaced as a whole, not concatenated. To append, build the
 *   array yourself: `{ sizes: [ ...defaults.sizes, ...extra.sizes ] }`.
 * - Sources that are not plain objects (`undefined`, `null`, arrays, strings,
 *   class instances) are ignored, so optional arguments can be passed directly.
 * - Non-plain objects are kept by reference, never cloned or merged. Changing a
 *   Map or a Date inside the result changes the original too.
 * - `__proto__` keys are skipped, so untrusted JSON (from HTML or an API) can
 *   never replace a prototype.
 * - Circular references are preserved: they point to the matching copy in the
 *   result, never back to a source.
 * - Only own enumerable string keys are copied (`Object.keys`). Symbol keys and
 *   non-enumerable properties are not copied, and getters are read once and
 *   stored as plain values.
 * - The result is always a new object with `Object.prototype`, even if every
 *   source was created with `Object.create( null )`.
 *
 * @param {...Object} sources - Objects to merge, in order of increasing priority. Non-plain-object values are ignored.
 *
 * @return {Object} A new object containing the merged result. `{}` when no plain-object source is given.
 *
 * @example
 * // At a glance
 * deepMerge( { a: 1, nav: { arrows: true } }, { nav: { dots: true } } );
 * // { a: 1, nav: { arrows: true, dots: true } }
 *
 * deepMerge( { title: 'Hi', onOpen: open }, { title: null, onOpen: undefined } );
 * // { title: null, onOpen: open } (null replaces, undefined is skipped)
 *
 * deepMerge( { sizes: [ 'S', 'M' ] }, { sizes: [ 'L' ] } );       // { sizes: [ 'L' ] }
 * deepMerge( { a: { b: 1 } }, { a: [ 1 ] } );                      // { a: [ 1 ] }
 * deepMerge( undefined, null, { a: 1 }, [ 1, 2 ], 'x', { b: 2 } ); // { a: 1, b: 2 }
 * deepMerge();                                                      // {}
 *
 * const defaults = { nav: { arrows: true } };
 * const result = deepMerge( defaults );
 * result.nav.arrows = false;
 * defaults.nav.arrows; // true (the result shares nothing with the sources)
 *
 * @example
 * // Real-life use case: plugin defaults, JavaScript options, then HTML options
 * // <div class="storepress-slider" data-storepress-slider='{"speed":500}'>
 * class Slider {
 *   static DEFAULTS = {
 *     autoplay: true,
 *     speed: 300,
 *     breakpoints: { 768: { perView: 2 }, 1024: { perView: 4 } },
 *   };
 *
 *   constructor( $element, options = {} ) {
 *     this.options = deepMerge(
 *       Slider.DEFAULTS,
 *       options, // may be undefined or partial
 *       getOptionsFromAttribute( $element, 'storepress-slider' )
 *     );
 *   }
 * }
 *
 * @example
 * // Real-life use case: cart drawer settings with partial translations
 * // A theme overrides one label; undefined values from an empty form field are skipped.
 * const CART_DRAWER_DEFAULTS = {
 *   ajax: { url: '/?wc-ajax=get_refreshed_fragments', timeout: 5000 },
 *   labels: { add: 'Add to cart', added: 'Added' },
 *   selectors: { drawer: '.cart-drawer' },
 * };
 *
 * const settings = deepMerge(
 *   CART_DRAWER_DEFAULTS,
 *   { labels: { added: 'In your cart' } },
 *   { ajax: { timeout: undefined } }
 * );
 * // settings.labels => { add: 'Add to cart', added: 'In your cart' }
 * // settings.ajax.timeout => 5000
 *
 * @example
 * // Real-life use case: updating state without changing the previous state
 * // Each variation swatch click produces a new state object; history keeps old ones.
 * const history = [];
 * let state = { selected: { color: null, size: null }, price: { html: '' } };
 *
 * function selectAttribute( name, value ) {
 *   history.push( state );
 *   state = deepMerge( state, { selected: { [ name ]: value } } );
 *   render( state );
 * }
 *
 * selectAttribute( 'color', 'blue' );
 * history[ 0 ].selected.color; // null (previous state is untouched)
 *
 * @example
 * // Real-life use case: merging untrusted JSON from the page
 * // JSON printed by a shortcode or an API cannot replace a prototype.
 * const fromPage = JSON.parse( '{"__proto__":{"isAdmin":true},"columns":3}' );
 * const options = deepMerge( { columns: 4 }, fromPage );
 * // options => { columns: 3 }
 * options.isAdmin; // undefined
 *
 * @see isPlainObject
 * @see getOptionsFromAttribute
 *
 * @since 0.6.0
 */
export function deepMerge( ...sources ) {
	const result = {};

	for ( const source of sources ) {
		if ( isPlainObject( source ) ) {
			mergeInto( result, source, new Map() );
		}
	}

	return result;
}
