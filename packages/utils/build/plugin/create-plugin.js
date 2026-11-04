'use strict';

/**
 * Internal dependencies
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPlugin = createPlugin;
var _createEventManager = require("../events/create-event-manager.js");
var _deepMerge = require("../object/deep-merge.js");
var _createPluginInstance = require("./create-plugin-instance.js");
var _getPluginInstance = require("./get-plugin-instance.js");
var _toSnakeCase = require("../string/to-snake-case.js");
/**
 * Creates a plugin controller that starts, stops and reloads a plugin class on
 * DOM elements through document-level events.
 *
 * You give it a plugin class, a default selector, default options and a
 * namespace. It returns a controller object. After `setup()`, the controller
 * listens on `document` for three custom events and turns each one into work on
 * the matching elements:
 *
 * | Controller call                | Event dispatched on `document`       | What happens per element                              |
 * | ------------------------------ | ------------------------------------ | ----------------------------------------------------- |
 * | `init( selector, settings )`   | `storepress:{namespace}:init`        | Creates an instance (once per element)                |
 * | `destroy( selector )`          | `storepress:{namespace}:destroy`     | Calls the instance's `destroy()`, which runs `reset()` |
 * | `reload( selector, settings )` | `storepress:{namespace}:reload`      | Destroy, then init with the new settings              |
 *
 * `{namespace}` is the namespace in snake_case (`'product-slider'` becomes
 * `product_slider`). The event detail is `{ element, settings }`, where
 * `element` is anything `getElements()` accepts, or an array of those. Because
 * the controller works through events, any script on the page (another plugin,
 * a theme, an inline script) can start or stop the plugin without importing it:
 * it only has to dispatch the event.
 *
 * Instances are stored per element in the global instance store
 * (`window.StorePress.$Plugins[ Namespace ].Instance`), so calling `init` twice
 * on the same element returns the existing instance instead of creating a new one.
 *
 * Writing a plugin class for this controller:
 * - The constructor receives `( element, settings )`.
 * - Put cleanup (remove listeners, restore markup) in a `reset()` method. It runs
 *   once when the instance is destroyed.
 * - After construction, `instance.element` and `instance.destroy` are set by
 *   `createPluginInstance()`. A `destroy()` method on your class is replaced.
 *
 * Notes:
 * - Call `setup()` before anything else. `get()`, `init()`, `destroy()`, `reload()`
 *   and `clear()` read `this.config` and throw a TypeError before `setup()`.
 * - `init( selector, settings )` passes `settings` to the plugin as is. It does
 *   **not** merge them with the default `options`. Merge them yourself if you need
 *   both: `init( selector, deepMerge( Plugin.config.options, extra ) )`.
 * - `reset()` is attached as a plain event listener, so inside it `this` is the
 *   **element**, not the instance. Define it as an arrow-function class field
 *   (`reset = () => { ... }`) or bind it in the constructor to use instance state.
 * - Calling `setup()` again removes the old document listeners but does not
 *   abort the previous `controller`. Call `clear()` first if you re-run `setup()`.
 * - Instances are held in a WeakMap keyed by element. When an element is removed
 *   from the page and nothing else references it, the instance can be garbage
 *   collected, but `reset()` is **not** called. Call `destroy()` before removing
 *   markup if the plugin attached listeners outside its element (e.g. on `window`).
 * - `createPlugin` does not register the controller globally. Use
 *   `createStorePressPlugin()` when other scripts need to find it.
 *
 * @param {Object}                                   config              - Plugin configuration.
 * @param {string|Element|Array<Element>|NodeList}   config.selector     - Default targets used when a method is called without a selector.
 * @param {Object}                                   [config.options={}] - Default settings passed to each new instance by `init()` and `reload()`.
 * @param {Function}                                 config.plugin       - Plugin class. Called with `new plugin( element, settings )`.
 * @param {string}                                   config.namespace    - Unique plugin name, e.g. `'product-slider'`. Used for the event names and the global stores.
 * @param {{onSetup?: Function, onClear?: Function}} [config.callback]   - Lifecycle callbacks, called with `this` set to the controller. `onSetup` runs at the end of `setup()`, `onClear` at the end of `clear()`.
 *
 * @return {Object} The plugin controller: `setup`, `clear`, `init`, `destroy`,
 * `reload`, `get`, the `controller` getter (an AbortController), the `instance`
 * getter (direct, event-free init/destroy/reload) and, after `setup()`, `config`
 * and `$event` (the event manager).
 *
 * @example
 * // At a glance
 * const Slider = createPlugin( {
 *   selector: '.product-slider',
 *   options: { autoplay: true, speed: 300 },
 *   plugin: ProductSlider,
 *   namespace: 'product-slider',
 * } );
 *
 * Slider.setup();                       // Listens for storepress:product_slider:{init,destroy,reload}
 * Slider.init();                        // new ProductSlider( el, { autoplay: true, speed: 300 } ) per .product-slider
 * Slider.get();                         // [ ProductSlider, ProductSlider ]
 * Slider.get( '#hero-slider' );         // [ ProductSlider ] or [] if not initialized
 * Slider.reload( '#hero-slider', { speed: 600 } ); // Destroy + init with { speed: 600 }
 * Slider.destroy();                     // Runs reset() on every instance and forgets them
 * Slider.clear();                       // destroy() + remove document listeners + abort controller
 *
 * @example
 * // Real-life use case: a product slider plugin with data-attribute settings
 * // Markup: <div class="product-slider" data-product-slider='{"speed":500}'>...</div>
 * class ProductSlider {
 *   constructor( element, settings ) {
 *     this.settings = {
 *       ...settings,
 *       ...getOptionsFromAttribute( element, 'product-slider' ),
 *     };
 *     this.next = element.querySelector( '.next' );
 *     this.next.addEventListener( 'click', this.onNext );
 *   }
 *
 *   onNext = () => {
 *     // Go to the next slide using this.settings.speed.
 *   };
 *
 *   // Arrow field so `this` is the instance, not the element.
 *   reset = () => {
 *     this.next.removeEventListener( 'click', this.onNext );
 *   };
 * }
 *
 * const Slider = createPlugin( {
 *   selector: '.product-slider',
 *   options: { speed: 300, loop: true },
 *   plugin: ProductSlider,
 *   namespace: 'product-slider',
 * } );
 *
 * document.addEventListener( 'DOMContentLoaded', () => {
 *   Slider.setup();
 *   Slider.init();
 * } );
 *
 * @example
 * // Real-life use case: start sliders inside WooCommerce AJAX fragments
 * // Quick view and cart fragments add new markup after page load.
 * jQuery( document.body ).on( 'wc_fragments_refreshed', () => {
 *   // Existing sliders are skipped: one instance per element.
 *   Slider.init();
 * } );
 *
 * // Or from any script, without importing Slider:
 * document.dispatchEvent(
 *   new CustomEvent( 'storepress:product_slider:init', {
 *     detail: { element: '.quick-view .product-slider', settings: { speed: 300 } },
 *   } )
 * );
 *
 * @example
 * // Real-life use case: rebuild the gallery slider when a variation changes
 * // WooCommerce swaps gallery images for the selected variation.
 * jQuery( '.variations_form' )
 *   .on( 'found_variation', ( event, variation ) => {
 *     Slider.reload( '.woocommerce-product-gallery .product-slider', {
 *       ...Slider.config.options,
 *       startAt: variation.image_id ? 0 : 1,
 *     } );
 *   } )
 *   .on( 'reset_data', () => {
 *     Slider.reload( '.woocommerce-product-gallery .product-slider' );
 *   } );
 *
 * @example
 * // Real-life use case: lifecycle callbacks and the shared AbortController
 * // Listeners added with `this.controller.signal` are removed by `clear()`.
 * const Slider = createPlugin( {
 *   selector: '.product-slider',
 *   plugin: ProductSlider,
 *   namespace: 'product-slider',
 *   callback: {
 *     onSetup() {
 *       window.addEventListener( 'resize', () => this.reload(), {
 *         signal: this.controller.signal,
 *       } );
 *     },
 *     onClear() {
 *       console.info( 'Product slider removed from the page.' );
 *     },
 *   },
 * } );
 *
 * Slider.setup();
 * Slider.init();
 *
 * // Leaving a single-page checkout step:
 * Slider.clear(); // Instances reset, document and resize listeners gone.
 *
 * @see createStorePressPlugin Registers the controller on `window.StorePress`.
 * @see createPluginInstance   Creates the per-element instances.
 * @see getPluginInstance      Reads instances without a controller.
 * @see createEventManager     Manages the document listeners.
 */
function createPlugin({
  selector,
  options = {},
  plugin,
  namespace,
  callback = {
    onSetup: () => {},
    onClear: () => {}
  }
}) {
  const initEventType = `init`;
  const destroyEventType = `destroy`;
  const reloadEventType = `reload`;
  return {
    /**
     * The event manager for this plugin's document listeners. `null` until
     * `setup()` runs. Its namespace is the plugin namespace in snake_case.
     *
     * @type {Object|null}
     *
     * @example
     * Slider.setup();
     * Slider.$event.get( document );
     * // [ { $element: document, $events: [
     * //   { eventType: 'storepress:product_slider:init', isNative: false, nativeType: '', size: 1 },
     * //   ... destroy, reload
     * // ] } ]
     */
    $event: null,
    /**
     * The AbortController created by `setup()` and aborted by `clear()`.
     * Read it through the `controller` getter.
     *
     * @type {AbortController|null}
     */
    $controller: null,
    /**
     * Direct, event-free access to instance management. The document event
     * handlers call these methods. Use them when you need the work done right
     * away on one target, without dispatching an event.
     *
     * Each read of `instance` returns a new object, so `this` inside its
     * methods is that object, not the controller.
     *
     * @return {{init: Function, destroy: Function, reload: Function}} Instance helpers.
     *
     * @example
     * // Start one slider immediately, with explicit settings.
     * Slider.instance.init( document.querySelector( '#hero-slider' ), { speed: 200 } );
     *
     * @example
     * // Destroy without going through document events.
     * Slider.instance.destroy( '#hero-slider' );
     */
    get instance() {
      return {
        /**
         * Creates instances for the targets (skipping elements that already
         * have one) and attaches each instance's `reset()` to the element's
         * `destroy` event, once.
         *
         * @param {string|Element|Array<Element>|NodeList} $element - Targets.
         * @param {Object}                                 settings - Settings passed to the plugin constructor.
         *
         * @return {void}
         *
         * @example
         * Slider.instance.init( '.product-slider', { speed: 300 } );
         *
         * @example
         * // Start the slider inside a quick view modal as soon as it opens.
         * Slider.instance.init( modal.querySelector( '.product-slider' ), Slider.config.options );
         */
        init($element, settings) {
          const instance = (0, _createPluginInstance.createPluginInstance)($element, settings, plugin, namespace);
          if (!instance || instance.length === 0) {
            return;
          }
          for (const {
            element,
            reset
          } of instance) {
            if (element && typeof reset === 'function') {
              element.removeEventListener('destroy', reset, {
                passive: true,
                once: true
              });
              element.addEventListener('destroy', reset, {
                passive: true,
                once: true
              });
            }
          }
        },
        /**
         * Calls `destroy()` on every existing instance for the targets.
         * Targets without an instance are ignored.
         *
         * @param {string|Element|Array<Element>|NodeList} $element - Targets.
         *
         * @return {void}
         *
         * @example
         * Slider.instance.destroy( '#hero-slider' );
         *
         * @example
         * // Clean up before closing the quick view modal.
         * Slider.instance.destroy( modal.querySelectorAll( '.product-slider' ) );
         * modal.remove();
         */
        destroy($element) {
          const instance = (0, _getPluginInstance.getPluginInstance)($element, namespace);
          if (!instance || instance.length === 0) {
            return;
          }
          for (const {
            destroy
          } of instance) {
            if (typeof destroy === 'function') {
              destroy();
            }
          }
        },
        /**
         * Destroys and then re-creates instances for the targets.
         *
         * @param {string|Element|Array<Element>|NodeList} $element - Targets.
         * @param {Object}                                 settings - Settings for the new instances.
         *
         * @return {void}
         *
         * @example
         * Slider.instance.reload( '#hero-slider', { speed: 600 } );
         *
         * @example
         * // Rebuild with the defaults after the customizer changes the layout.
         * wp.customize( 'slider_layout', ( setting ) => {
         *   setting.bind( () => Slider.instance.reload( '.product-slider', Slider.config.options ) );
         * } );
         */
        reload($element, settings) {
          this.destroy($element);
          this.init($element, settings);
        }
      };
    },
    /**
     * The AbortController for this setup. Pass `controller.signal` to your own
     * `addEventListener` calls so `clear()` removes them. A new controller is
     * created on each `setup()`.
     *
     * @return {AbortController|null} The controller, or null before `setup()`.
     *
     * @example
     * window.addEventListener( 'scroll', onScroll, { signal: Slider.controller.signal } );
     *
     * @example
     * // Check whether the plugin has been cleared.
     * if ( Slider.controller?.signal.aborted ) {
     *   Slider.setup();
     * }
     */
    get controller() {
      return this.$controller;
    },
    /**
     * Returns the instances for the given targets. Targets without an
     * instance are skipped.
     *
     * @param {string|Element|Array<Element>|NodeList} [$element=this.config.selector] - Targets. Defaults to the configured selector.
     *
     * @return {Array<Object>} Instances, in target order. Empty when none exist.
     *
     * @example
     * Slider.get();                    // Every initialized .product-slider
     * Slider.get( '#hero-slider' );    // [ ProductSlider ] or []
     *
     * @example
     * // Jump to the slide of the image a customer clicked.
     * thumbnail.addEventListener( 'click', () => {
     *   Slider.get( '#hero-slider' )[ 0 ]?.goTo( Number( thumbnail.dataset.index ) );
     * } );
     */
    get($element = this.config.selector) {
      return (0, _getPluginInstance.getPluginInstance)($element, namespace);
    },
    /**
     * Prepares the controller: stores the merged config, creates the event
     * manager and AbortController, attaches the `init`, `destroy` and
     * `reload` listeners on `document`, then calls `callback.onSetup`.
     * It does not create any instances; call `init()` for that.
     *
     * Values passed here override the ones given to `createPlugin()`:
     * `selector` replaces it, `options` and `callback` are deep merged.
     *
     * @param {Object}                                 [overrides]          - Optional overrides.
     * @param {string|Element|Array<Element>|NodeList} [overrides.selector] - Default targets.
     * @param {Object}                                 [overrides.options]  - Deep merged into the default options.
     * @param {Object}                                 [overrides.callback] - Deep merged into the callbacks.
     *
     * @return {void}
     *
     * @example
     * Slider.setup();
     *
     * @example
     * // Override defaults from PHP-localized settings.
     * Slider.setup( {
     *   selector: '.my-theme-slider',
     *   options: window.productSliderSettings, // wp_localize_script()
     * } );
     */
    setup({
      selector: $selector,
      options: $options,
      callback: $callback
    } = {
      selector,
      options,
      callback
    }) {
      const defaultCallback = {
        onSetup: () => {},
        onClear: () => {}
      };
      this.config = {
        selector: $selector || selector,
        options: (0, _deepMerge.deepMerge)(options, $options),
        callback: (0, _deepMerge.deepMerge)(defaultCallback, callback, $callback)
      };
      this.$event = (0, _createEventManager.createEventManager)((0, _toSnakeCase.toSnakeCase)(namespace));
      this.$controller = new AbortController();
      this.$event.removeAll();
      const handleInit = event => {
        const defaultSettings = {};
        const settings = {
          ...defaultSettings,
          ...event.detail?.settings
        };
        const element = event.detail?.element;
        if (Array.isArray(element)) {
          for (const el of element) {
            this.instance.init(el, settings);
          }
        } else {
          this.instance.init(element, settings);
        }
      };
      const handleDestroy = event => {
        const element = event.detail?.element;
        if (Array.isArray(element)) {
          for (const el of element) {
            this.instance.destroy(el);
          }
        } else {
          this.instance.destroy(element);
        }
      };
      const handleReload = event => {
        const defaultSettings = {};
        const settings = {
          ...defaultSettings,
          ...event.detail?.settings
        };
        const element = event.detail?.element;
        if (Array.isArray(element)) {
          for (const el of element) {
            this.instance.reload(el, settings);
          }
        } else {
          this.instance.reload(element, settings);
        }
      };
      const eventOptions = {
        passive: true
      };

      // Init.
      this.$event.add(document, initEventType, handleInit, eventOptions);

      // Destroy.
      this.$event.add(document, destroyEventType, handleDestroy, eventOptions);

      // Reload.
      this.$event.add(document, reloadEventType, handleReload, eventOptions);
      this.config.callback.onSetup.call(this);
    },
    /**
     * Tears the plugin down: destroys instances for the targets, removes the
     * document listeners, aborts the controller and calls `callback.onClear`.
     * Call `setup()` again to use the controller afterwards.
     *
     * @param {string|Element|Array<Element>|NodeList} [$selector=this.config.selector] - Targets to destroy first.
     *
     * @return {void}
     *
     * @example
     * Slider.clear();
     *
     * @example
     * // Only destroy the sliders inside one section, then remove listeners.
     * Slider.clear( '#upsells .product-slider' );
     */
    clear($selector = this.config.selector) {
      this.destroy($selector);
      this.$event.removeAll();
      this.controller.abort();
      this.config.callback.onClear.call(this);
    },
    /**
     * Dispatches `storepress:{namespace}:init` on `document` to create
     * instances. Elements that already have an instance are skipped.
     *
     * @param {string|Element|Array<Element>|NodeList|Array} [$selector=this.config.selector] - Targets, or an array of targets.
     * @param {Object}                                       [$settings=this.config.options]  - Settings for new instances. Replaces the defaults; it is not merged with them.
     *
     * @return {void}
     *
     * @example
     * Slider.init();
     *
     * @example
     * // Related products: same plugin, autoplay off.
     * Slider.init( '.related.products .product-slider', {
     *   ...Slider.config.options,
     *   autoplay: false,
     * } );
     */
    init($selector = this.config.selector, $settings = this.config.options) {
      this.$event.trigger(document, initEventType, {
        element: $selector,
        settings: $settings
      });
    },
    /**
     * Dispatches `storepress:{namespace}:destroy` on `document`. Each matching
     * instance's `reset()` runs and the instance is removed from the store.
     *
     * @param {string|Element|Array<Element>|NodeList|Array} [$selector=this.config.selector] - Targets, or an array of targets.
     *
     * @return {void}
     *
     * @example
     * Slider.destroy( '#hero-slider' );
     *
     * @example
     * // Destroy several targets at once.
     * Slider.destroy( [ '#hero-slider', document.querySelector( '.upsells .product-slider' ) ] );
     */
    destroy($selector = this.config.selector) {
      this.$event.trigger(document, destroyEventType, {
        element: $selector
      });
    },
    /**
     * Dispatches `storepress:{namespace}:reload` on `document`: destroy, then
     * init with the given settings.
     *
     * @param {string|Element|Array<Element>|NodeList|Array} [$selector=this.config.selector] - Targets, or an array of targets.
     * @param {Object}                                       [$settings=this.config.options]  - Settings for the new instances. Replaces the defaults.
     *
     * @return {void}
     *
     * @example
     * Slider.reload(); // Every slider, default options
     *
     * @example
     * // Faster slides on small screens.
     * matchMedia( '(max-width: 600px)' ).addEventListener( 'change', ( event ) => {
     *   Slider.reload( '#hero-slider', {
     *     ...Slider.config.options,
     *     speed: event.matches ? 200 : 300,
     *   } );
     * } );
     */
    reload($selector = this.config.selector, $settings = this.config.options) {
      this.$event.trigger(document, reloadEventType, {
        element: $selector,
        settings: $settings
      });
    }
  };
}