'use strict';
/**
 * Creates a Map-like store keyed by DOM elements (or any objects) that does
 * not keep its keys alive.
 *
 * A plain `Map` holds a strong reference to every key, so an element removed
 * from the page stays in memory, together with its value, for as long as the
 * Map lives. A `WeakMap` lets the element be garbage collected, but it cannot
 * be iterated and has no `size`. This store gives you both: values live in a
 * WeakMap, and a Set of WeakRefs keeps the keys iterable. Keys that have been
 * garbage collected are skipped and pruned automatically during iteration.
 *
 * It has the same API as `Map` (`has`, `get`, `set`, `delete`, `clear`,
 * `size`, `forEach`, `keys`, `values`, `entries`, `for...of`), so it can
 * replace a Map keyed by elements without changing the calling code. Use it
 * for plugin instance registries, per-element caches and listener stores
 * (`createEventManager` uses it) on pages where elements are replaced by
 * AJAX: WooCommerce cart fragments, filtered product grids, quick views.
 *
 * How it works:
 * - `data`  (WeakMap: key => value): the stored values. Holds keys weakly.
 * - `refs`  (Set of WeakRef): one weak reference per key, used for iteration.
 * - `refOf` (WeakMap: key => WeakRef): finds a key's WeakRef in O(1) on delete.
 *
 * Notes:
 * - Keys must be objects (elements, `document`, functions, plain objects).
 *   Strings and numbers throw a `TypeError` in `set`, exactly like WeakMap.
 *   Use a plain `Map` for string keys.
 * - The value must not be referenced from anywhere that lives longer than the
 *   element, or the element stays in memory. A value that refers back to its
 *   own key is fine.
 * - Garbage collection timing is up to the browser. A detached element can
 *   still appear in `size`, iteration and `has` until it is collected. Check
 *   `$element.isConnected` when that matters.
 * - Still call `delete` (or your own cleanup) when you know an element is
 *   gone. This store is a safety net for forgotten cleanup, not a replacement.
 * - `size` walks every entry (O(n)). Avoid calling it in hot paths such as
 *   scroll handlers.
 * - Updating an existing key keeps its position in iteration order. Deleting
 *   and setting it again moves it to the end, like `Map`.
 * - Requires `WeakRef` (all modern browsers since 2021). jsdom's `window`
 *   object is rejected by `new WeakRef()`, so `window` cannot be a key in
 *   jsdom-based tests.
 *
 * @return {{
 *   has: ( key: Object ) => boolean,
 *   get: ( key: Object ) => *,
 *   set: ( key: Object, value: * ) => Object,
 *   delete: ( key: Object ) => boolean,
 *   clear: () => void,
 *   size: number,
 *   forEach: ( callback: Function, thisArg?: * ) => void,
 *   keys: () => Iterator<Object>,
 *   values: () => Iterator<*>,
 *   entries: () => Iterator<Array>
 * }} A Map-like store whose keys can be garbage collected. Iterable with `for...of`.
 *
 * @example
 * // At a glance
 * const store = createWeakElementMap();
 * const $button = document.querySelector( '#buy-now' );
 *
 * store.set( $button, { clicks: 0 } );   // returns the store
 * store.get( $button ).clicks++;         // 1
 * store.has( $button );                  // true
 * store.size;                            // 1
 * [ ...store ];                          // [ [ $button, { clicks: 1 } ] ]
 * store.delete( $button );               // true
 * store.delete( $button );               // false (already removed)
 * store.get( $button );                  // undefined
 * store.set( 'buy-now', 1 );             // throws TypeError (keys must be objects)
 *
 * @example
 * // Real-life use case: product gallery instances that survive AJAX filtering
 * // Product grid HTML is replaced after a filter; old galleries can be collected.
 * const galleries = createWeakElementMap();
 *
 * function initGalleries( $root = document ) {
 *   $root.querySelectorAll( '.product-gallery' ).forEach( ( $gallery ) => {
 *     if ( ! galleries.has( $gallery ) ) {
 *       galleries.set( $gallery, new ProductGallery( $gallery ) );
 *     }
 *   } );
 * }
 *
 * // Pause every gallery that is still alive when the tab is hidden.
 * document.addEventListener( 'visibilitychange', () => {
 *   galleries.forEach( ( gallery ) => document.hidden ? gallery.pause() : gallery.play() );
 * } );
 *
 * @example
 * // Real-life use case: caching parsed variation data per form
 * // Parsing data-product_variations JSON on every swatch click is slow.
 * const variationCache = createWeakElementMap();
 *
 * function getVariations( $form ) {
 *   if ( ! variationCache.has( $form ) ) {
 *     variationCache.set( $form, JSON.parse( $form.dataset.product_variations || '[]' ) );
 *   }
 *   return variationCache.get( $form );
 * }
 *
 * // A quick-view modal is closed and its form removed: the cached data goes with it.
 *
 * @example
 * // Real-life use case: one ResizeObserver per sticky add-to-cart bar
 * const observers = createWeakElementMap();
 *
 * function watchSize( $element, onResize ) {
 *   if ( observers.has( $element ) ) {
 *     return;
 *   }
 *   const observer = new ResizeObserver( ( [ entry ] ) => onResize( entry.contentRect ) );
 *   observer.observe( $element );
 *   observers.set( $element, observer );
 * }
 *
 * function unwatchSize( $element ) {
 *   observers.get( $element )?.disconnect();
 *   observers.delete( $element );
 * }
 *
 * @example
 * // Real-life use case: finding elements that were removed without cleanup
 * // Run in the console while testing a cart drawer that re-renders its items.
 * const leaked = [ ...store.keys() ].filter( ( $element ) => ! $element.isConnected );
 * console.log( `${ leaked.length } element(s) removed without cleanup`, leaked );
 *
 * // Clean them up now instead of waiting for garbage collection.
 * leaked.forEach( ( $element ) => store.delete( $element ) );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef WeakRef
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap WeakMap
 *
 * @since 0.13.0
 */
export function createWeakElementMap() {
	const data = new WeakMap();
	const refs = new Set();
	const refOf = new WeakMap();

	/**
	 * Yields [ key, value ] for every key that is still alive, and prunes the
	 * WeakRefs of keys that have been garbage collected.
	 *
	 * Every iterating method (`size`, `forEach`, `keys`, `values`, `entries`,
	 * `clear`, `for...of`) goes through this generator, so pruning happens
	 * automatically whenever the store is read in order.
	 *
	 * @private
	 *
	 * @return {Generator<Array>} Live [ key, value ] pairs, in insertion order.
	 *
	 * @example
	 * // Iterate live pairs
	 * for ( const [ $element, value ] of liveEntries() ) {
	 *   console.log( $element, value );
	 * }
	 *
	 * @example
	 * // Count live keys (this is how `size` works)
	 * let count = 0;
	 * for ( const entry of liveEntries() ) {
	 *   count++;
	 * }
	 */
	function* liveEntries() {
		for ( const ref of refs ) {
			const key = ref.deref();
			if ( key === undefined ) {
				// Collected by the garbage collector: forget its WeakRef.
				refs.delete( ref );
				continue;
			}
			yield [ key, data.get( key ) ];
		}
	}

	const map = {
		/**
		 * Checks whether a key is stored.
		 *
		 * @param {Object} key - Element or other object. Primitives return `false`.
		 *
		 * @return {boolean} True if the key has a value.
		 *
		 * @example
		 * // Initialize a plugin only once per element
		 * if ( ! store.has( $element ) ) {
		 *   store.set( $element, init( $element ) );
		 * }
		 *
		 * @example
		 * store.has( $removedButStillReferenced ); // true until deleted or collected
		 * store.has( 'buy-now' );                  // false (primitive)
		 */
		has( key ) {
			return data.has( key );
		},

		/**
		 * Gets the value stored for a key.
		 *
		 * @param {Object} key - Element or other object.
		 *
		 * @return {*} The value, or undefined when the key is not stored.
		 *
		 * @example
		 * // Call a method on an instance if one exists
		 * const instance = store.get( $element );
		 * instance?.refresh();
		 *
		 * @example
		 * // Default value for elements that were never stored
		 * const quantity = store.get( $cartRow ) ?? 1;
		 */
		get( key ) {
			return data.get( key );
		},

		/**
		 * Stores a value for a key. Updating an existing key keeps its
		 * original position in iteration order, like Map.
		 *
		 * @param {Object} key   - Element or other object. Primitives throw a TypeError.
		 * @param {*}      value - Any value.
		 *
		 * @throws {TypeError} If the key is not an object.
		 *
		 * @return {Object} The store, for chaining.
		 *
		 * @example
		 * // Chain several calls
		 * store
		 *   .set( $header, { sticky: true } )
		 *   .set( $footer, { sticky: false } );
		 *
		 * @example
		 * // Updating keeps the original order
		 * store.set( $a, 1 ).set( $b, 2 ).set( $a, 3 );
		 * [ ...store.values() ]; // [ 3, 2 ]
		 */
		set( key, value ) {
			if ( ! data.has( key ) ) {
				const ref = new WeakRef( key );
				refs.add( ref );
				refOf.set( key, ref );
			}
			data.set( key, value );
			return map;
		},

		/**
		 * Removes a key and its value.
		 *
		 * @param {Object} key - Element or other object.
		 *
		 * @return {boolean} True if the key existed and was removed.
		 *
		 * @example
		 * // Before removing an element from the page
		 * store.get( $card )?.destroy();
		 * store.delete( $card );
		 * $card.remove();
		 *
		 * @example
		 * store.delete( $card );       // true
		 * store.delete( $card );       // false (already removed)
		 * store.delete( 'not-a-key' ); // false
		 */
		delete( key ) {
			const ref = refOf.get( key );
			if ( ref ) {
				refs.delete( ref );
				refOf.delete( key );
			}
			return data.delete( key );
		},

		/**
		 * Removes every key and value.
		 *
		 * @return {void}
		 *
		 * @example
		 * // Reset a measurement cache when the layout changes
		 * window.addEventListener( 'resize', () => sizeCache.clear() );
		 *
		 * @example
		 * // Destroy every instance, then forget them
		 * store.forEach( ( instance ) => instance.destroy() );
		 * store.clear();
		 * store.size; // 0
		 */
		clear() {
			for ( const [ key ] of liveEntries() ) {
				data.delete( key );
				refOf.delete( key );
			}
			refs.clear();
		},

		/**
		 * Number of keys that are still alive. Iterates every entry, so it is O(n).
		 *
		 * @type {number}
		 *
		 * @example
		 * console.log( `${ store.size } element(s) tracked` );
		 *
		 * @example
		 * // Skip work when nothing is registered
		 * if ( tooltips.size === 0 ) {
		 *   return;
		 * }
		 */
		get size() {
			const iterator = liveEntries();
			let count = 0;
			while ( ! iterator.next().done ) {
				count++;
			}
			return count;
		},

		/**
		 * Calls a function for every live entry, in insertion order.
		 * Same signature as Map.prototype.forEach.
		 *
		 * @param {( value: *, key: Object, map: Object ) => void} callback  - Called with value, key and the store.
		 * @param {*}                                              [thisArg] - Value of `this` inside callback.
		 *
		 * @return {void}
		 *
		 * @example
		 * // Refresh every live instance
		 * store.forEach( ( instance ) => instance.refresh() );
		 *
		 * @example
		 * // Use the key too: reposition each tooltip next to its trigger
		 * tooltips.forEach( ( { $tip }, $trigger ) => positionTooltip( $tip, $trigger ) );
		 */
		forEach( callback, thisArg ) {
			for ( const [ key, value ] of liveEntries() ) {
				callback.call( thisArg, value, key, map );
			}
		},

		/**
		 * Iterates live keys.
		 *
		 * @return {Iterator<Object>} Keys in insertion order.
		 *
		 * @example
		 * // Elements that left the page but were never deleted
		 * const detached = [ ...store.keys() ].filter( ( $el ) => ! $el.isConnected );
		 *
		 * @example
		 * for ( const $element of store.keys() ) {
		 *   $element.classList.add( 'is-initialized' );
		 * }
		 */
		*keys() {
			for ( const [ key ] of liveEntries() ) {
				yield key;
			}
		},

		/**
		 * Iterates values of live keys.
		 *
		 * @return {Iterator<*>} Values in insertion order.
		 *
		 * @example
		 * for ( const instance of store.values() ) {
		 *   instance.destroy();
		 * }
		 *
		 * @example
		 * // Snapshot of all instances as an array
		 * const instances = Array.from( store.values() );
		 */
		*values() {
			for ( const [ , value ] of liveEntries() ) {
				yield value;
			}
		},

		/**
		 * Iterates [ key, value ] pairs of live keys.
		 *
		 * @return {Iterator<Array>} Pairs in insertion order.
		 *
		 * @example
		 * // Strong copy for inspection (keeps keys alive while it exists)
		 * const snapshot = new Map( store.entries() );
		 *
		 * @example
		 * for ( const [ $element, options ] of store.entries() ) {
		 *   console.log( $element.id, options );
		 * }
		 */
		entries() {
			return liveEntries();
		},

		/**
		 * Makes the store work with for...of, spread and Array.from.
		 *
		 * @return {Iterator<Array>} [ key, value ] pairs in insertion order.
		 *
		 * @example
		 * for ( const [ $element, value ] of store ) {
		 *   console.log( $element, value );
		 * }
		 *
		 * @example
		 * const pairs = [ ...store ];           // [ [ key, value ], ... ]
		 * const plain = Array.from( store );    // same result
		 */
		[ Symbol.iterator ]() {
			return liveEntries();
		},
	};

	return map;
}
