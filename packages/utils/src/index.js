/**
 * WeakMap to store plugin instances associated with DOM elements
 * @type {WeakMap<HTMLElement, any>}
 */
const weakMap = new WeakMap()

/**
 * Retrieves a single DOM element based on the provided selector.
 *
 * @param {string|HTMLElement|null} [selector=null] - CSS selector string or HTMLElement
 * @returns {HTMLElement|null} The found element or null if not found/invalid
 *
 * @example
 * // Get element by ID
 * const element1 = getElement('#myId');
 *
 * // Pass HTMLElement directly
 * const element2 = getElement(document.body);
 *
 * // Invalid selector returns null
 * const element3 = getElement(null); // returns null
 */
export function getElement (selector = null) {
  if (null === selector) return null
  if (typeof selector === 'string') return document.querySelector(selector)
  return selector instanceof HTMLElement ? selector : null
}

/**
 * Gets multiple DOM elements based on the provided selector
 * @param {string|HTMLElement|NodeList|Array<HTMLElement>} [selectors=[]] - CSS selector string, HTMLElement, or NodeList
 * @returns {NodeList|Array<HTMLElement>} Array of found elements or empty array
 */
export function getElements (selectors = []) {

  if (selectors.length === 0) return []
  if (typeof selectors === 'string') return document.querySelectorAll(selectors)
  return selectors instanceof HTMLElement ? [selectors] : selectors
}

/**
 * Converts a string to camelCase
 * @param {string} string - String to convert
 * @returns {string} Converted camelCase string
 */
export function toCamelCase (string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2) => {
    if (p2) return p2.toUpperCase()
    return p1.toLowerCase()
  })
}

/**
 * Recursively merges multiple objects into a single object, with later sources
 * taking precedence over earlier ones. Only plain objects are deeply merged;
 * arrays, null values, and primitives are replaced entirely.
 *
 * The function performs a deep merge where:
 * - Plain objects are recursively merged
 * - Arrays completely replace previous arrays (no concatenation)
 * - Null values replace previous values
 * - Primitive values (string, number, boolean) replace previous values
 * - Later sources override earlier sources at each level
 *
 * @param {...Object} sources - One or more objects to merge
 * @returns {Object} A new object containing the merged properties from all sources
 *
 * @example
 * // Basic object merging
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { b: 3, c: 4 };
 * const result = deepMerge(obj1, obj2);
 * console.log(result); // { a: 1, b: 3, c: 4 }
 *
 * @example
 * // Deep merging nested objects
 * const defaults = {
 *   theme: {
 *     colors: { primary: 'blue', secondary: 'gray' },
 *     spacing: { margin: 10, padding: 5 }
 *   },
 *   features: { search: true }
 * };
 *
 * const customConfig = {
 *   theme: {
 *     colors: { primary: 'red' }, // Only primary changes, secondary preserved
 *     font: 'Arial'               // New property added
 *   },
 *   features: { search: false, filter: true }
 * };
 *
 * const merged = deepMerge(defaults, customConfig);
 * console.log(merged);
 * // Result: {
 * //   theme: {
 * //     colors: { primary: 'red', secondary: 'gray' },
 * //     spacing: { margin: 10, padding: 5 },
 * //     font: 'Arial'
 * //   },
 * //   features: { search: false, filter: true }
 * // }
 *
 * @example
 * // Arrays are replaced, not merged
 * const obj1 = {
 *   tags: ['javascript', 'node'],
 *   config: { debug: true }
 * };
 * const obj2 = {
 *   tags: ['react', 'typescript'],
 *   config: { verbose: false }
 * };
 *
 * const result = deepMerge(obj1, obj2);
 * console.log(result);
 * // Result: {
 * //   tags: ['react', 'typescript'], // Array replaced entirely
 * //   config: { debug: true, verbose: false } // Objects merged deeply
 * // }
 *
 * @example
 * // Multiple sources - later sources take precedence
 * const base = { a: 1, nested: { x: 10, y: 20 } };
 * const override1 = { b: 2, nested: { x: 15, z: 30 } };
 * const override2 = { c: 3, nested: { y: 25 } };
 *
 * const result = deepMerge(base, override1, override2);
 * console.log(result);
 * // Result: {
 * //   a: 1,                    // from base
 * //   b: 2,                    // from override1
 * //   c: 3,                    // from override2
 * //   nested: {
 * //     x: 15,                 // from override1 (overrides base)
 * //     y: 25,                 // from override2 (overrides base and override1)
 * //     z: 30                  // from override1
 * //   }
 * // }
 *
 * @example
 * // Null values and primitives replace objects
 * const obj1 = {
 *   settings: { theme: 'dark', lang: 'en' },
 *   data: { items: [1, 2, 3] }
 * };
 * const obj2 = {
 *   settings: null,        // Replaces entire settings object
 *   data: 'no data'        // Replaces entire data object
 * };
 *
 * const result = deepMerge(obj1, obj2);
 * console.log(result);
 * // Result: {
 * //   settings: null,
 * //   data: 'no data'
 * // }
 *
 * @example
 * // Common use case: Configuration with defaults
 * const defaultConfig = {
 *   api: {
 *     baseUrl: 'https://api.example.com',
 *     timeout: 5000,
 *     retries: 3
 *   },
 *   ui: {
 *     theme: 'light',
 *     animations: true,
 *     notifications: { enabled: true, position: 'top-right' }
 *   }
 * };
 *
 * const userConfig = {
 *   api: { timeout: 10000 },
 *   ui: {
 *     theme: 'dark',
 *     notifications: { position: 'bottom-left' }
 *   }
 * };
 *
 * const finalConfig = deepMerge(defaultConfig, userConfig);
 * console.log(finalConfig);
 * // Result: {
 * //   api: {
 * //     baseUrl: 'https://api.example.com', // from defaults
 * //     timeout: 10000,                     // from user config
 * //     retries: 3                          // from defaults
 * //   },
 * //   ui: {
 * //     theme: 'dark',                      // from user config
 * //     animations: true,                   // from defaults
 * //     notifications: {
 * //       enabled: true,                    // from defaults
 * //       position: 'bottom-left'           // from user config
 * //     }
 * //   }
 * // }
 *
 * @example
 * // Edge cases with different data types
 * const obj1 = {
 *   mixed: { value: 42 },
 *   list: [1, 2, 3],
 *   flag: true
 * };
 * const obj2 = {
 *   mixed: 'string',      // Object replaced with string
 *   list: null,           // Array replaced with null
 *   flag: { enabled: false } // Boolean replaced with object
 * };
 *
 * const result = deepMerge(obj1, obj2);
 * console.log(result);
 * // Result: {
 * //   mixed: 'string',
 * //   list: null,
 * //   flag: { enabled: false }
 * // }
 *
 * @example
 * // Empty objects and single parameter
 * console.log(deepMerge({})); // {}
 * console.log(deepMerge({ a: 1 })); // { a: 1 }
 * console.log(deepMerge({}, { b: 2 }, {})); // { b: 2 }
 */
export function deepMerge (...sources) {
  const result = {}
  for (const src of sources) {
    for (const key in src) {
      if (src.hasOwnProperty(key)) {
        const isObject = typeof src[key] === 'object'
          && src[key] !== null
          && !Array.isArray(src[key])
          && typeof result[key] === 'object'
          && result[key] !== null
          && !Array.isArray(result[key])

        if (isObject) {
          result[key] = deepMerge(result[key], src[key])
        } else {
          result[key] = src[key]
        }
      }
    }
  }

  return result
}

/**
 * Converts a string to PascalCase (UpperCamelCase)
 * @param {string} string - String to convert
 * @returns {string} Converted PascalCase string
 */
export function toUpperCamelCase (string) {
  return string.replace(/^([a-z])|[\s-_](\w)/g, (match, p1, p2) => {
    if (p2) return p2.toUpperCase()
    return p1.toUpperCase()
  })
}

/**
 * Extracts and parses configuration options from HTML data attributes with support for
 * nested structures, type conversion, and attribute overrides.
 *
 * This function supports multiple ways to define options:
 * 1. Main data attribute with JSON/object notation
 * 2. Override attributes using hyphenated keys for nested properties
 * 3. Automatic type conversion for strings, numbers, booleans, arrays, objects, and regex
 *
 * @param {HTMLElement} $element - The DOM element to extract data attributes from
 * @param {string} dataAttributeName - The base name of the data attribute (without 'data-' prefix)
 * @param {Object} [defaults={}] - Default options object to merge with extracted options
 * @returns {Object} Merged configuration object with defaults, main options, and overrides
 *
 * @example
 * // Basic usage with JSON in data attribute
 * // HTML: <div data-config='{"autoplay": true, "speed": 500}'></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'config');
 * console.log(options); // { autoplay: true, speed: 500 }
 *
 * @example
 * // Using override attributes for nested configuration
 * // HTML: <div data-slider='{"autoplay": true}'
 * //            data-slider-animation-duration="800"
 * //            data-slider-animation-easing="ease-in-out"></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'slider');
 * console.log(options);
 * // Result: {
 * //   autoplay: true,
 * //   animation: {
 * //     duration: 800,
 * //     easing: "ease-in-out"
 * //   }
 * // }
 *
 * @example
 * // Type conversion examples
 * // HTML: <div data-options-enabled="true"
 * //            data-options-count="42"
 * //            data-options-rate="3.14"
 * //            data-options-pattern="/^test$/i"
 * //            data-options-items='["a", "b", "c"]'></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'options');
 * console.log(options);
 * // Result: {
 * //   enabled: true,           // boolean
 * //   count: 42,              // number
 * //   rate: 3.14,             // float
 * //   pattern: /^test$/i,     // RegExp
 * //   items: ["a", "b", "c"]  // array
 * // }
 *
 * @example
 * // Using defaults and priority order
 * const defaults = {
 *   speed: 300,
 *   autoplay: false,
 *   navigation: {
 *     arrows: true,
 *     dots: false
 *   }
 * };
 *
 * // HTML: <div data-carousel='{"autoplay": true}'
 * //            data-carousel-navigation-dots="true"></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'carousel', defaults);
 * console.log(options);
 * // Result: {
 * //   speed: 300,        // from defaults
 * //   autoplay: true,    // from main data attribute (overrides default)
 * //   navigation: {
 * //     arrows: true,    // from defaults
 * //     dots: true       // from override attribute
 * //   }
 * // }
 *
 * @example
 * // Complex nested structure with multiple override levels
 * // HTML: <div data-widget-theme-colors-primary="#ff0000"
 * //            data-widget-theme-colors-secondary="#00ff00"
 * //            data-widget-layout-sidebar-width="300"
 * //            data-widget-layout-sidebar-position="left"></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'widget');
 * console.log(options);
 * // Result: {
 * //   theme: {
 * //     colors: {
 * //       primary: "#ff0000",
 * //       secondary: "#00ff00"
 * //     }
 * //   },
 * //   layout: {
 * //     sidebar: {
 * //       width: 300,
 * //       position: "left"
 * //     }
 * //   }
 * // }
 *
 * @example
 * // Boolean value variations
 * // HTML: <div data-flags-active="true"
 * //            data-flags-visible="yes"
 * //            data-flags-enabled="y"
 * //            data-flags-disabled="false"
 * //            data-flags-hidden="no"
 * //            data-flags-inactive="n"></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'flags');
 * console.log(options);
 * // Result: {
 * //   active: true,
 * //   visible: true,
 * //   enabled: true,
 * //   disabled: false,
 * //   hidden: false,
 * //   inactive: false
 * // }
 *
 * @example
 * // Error handling - invalid JSON falls back gracefully
 * // HTML: <div data-config='{"invalid": json}'></div>
 * const element = document.querySelector('div');
 * const options = getOptionsFromAttribute(element, 'config', {fallback: true});
 * console.log(options); // { fallback: true } - defaults only due to parsing error
 *
 * @throws {Error} Throws error if all JSON parsing strategies fail for nested data
 */
function getOptionsFromAttribute ($element, dataAttributeName, defaults = {}) {

  const getValue = (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const lowerValue = value.toLowerCase()
    const isJSON = value.charAt(0) === '{' || value.charAt(0) === '['
    const isNumber = isNaN(Number(value)) === false

    // Check for boolean values
    if (['true', 'yes', 'y'].includes(lowerValue)) {
      return true
    }

    if (['false', 'no', 'n'].includes(lowerValue)) {
      return false
    }

    // Check for Object or Array values
    if (isJSON) {
      return getJSONData(value, reviver)
    }

    // Check for regex pattern: /pattern/flags
    const regexMatch = value.match(/^\/(.+)\/([gimsuyx]*)$/)
    if (regexMatch) {
      try {
        const [, pattern, flags] = regexMatch
        return new RegExp(pattern, flags)
      } catch (error) {
        console.warn(`Invalid regex pattern: ${value}`, error)
        return value // Return original string if regex is invalid
      }
    }

    // Check for numeric values
    if (isNumber) {
      return Number(value)
    }

    // Return as string if no type conversion applies
    return value
  }

  const reviver = (key, value) => {
    if (typeof value !== 'string') {
      return value
    }

    return getValue(value)
  }

  const getJSONData = (value, reviver) => {
    const strategies = [
      (val) => val.replaceAll('\'', '"'),
      (val) => val.replaceAll('\'', '"').replaceAll('\\', '\\\\'),
      // Add more strategies here if needed
    ]

    for (const strategy of strategies) {
      try {
        return JSON.parse(strategy(value), reviver)
      } catch {}
    }

    throw new Error('All parsing strategies failed')
  }

  const makeNestedOptions = (nestedData) => {
    const result = {}

    const processLevel = (data, target) => {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]

          // Set the value for current key
          if (item.value !== undefined) {
            target[key] = item.value
          }

          // Process children recursively if they exist
          if (item.child && typeof item.child === 'object') {
            // Ensure target[key] is an object to hold nested properties
            if (typeof target[key] !== 'object' || target[key] === null) {
              target[key] = item.value
            }

            // Recursively process the child data
            processLevel(item.child, target[key])
          }
        }
      }
    }

    // Start the recursive processing
    processLevel(nestedData, result)

    return result
  }

  const getOverrideOptions = (keys, dataset) => {

    // Stable sort: fewer hyphens first
    const sortedKeys = keys.map((key, index) => ({ key, index })).sort((a, b) => {
      const hyphenCountA = (a.key.match(/-/g) || []).length
      const hyphenCountB = (b.key.match(/-/g) || []).length
      if (hyphenCountA === hyphenCountB) {
        return a.index - b.index // preserve original order
      }
      return hyphenCountA - hyphenCountB
    }).map(item => item.key)

    const nestedData = {}

    sortedKeys.forEach(key => {
      const parts = key.split('-')
      let oldKey = ''
      let currentKey = ''
      let currentObj = nestedData

      parts.forEach(part => {
        currentKey = currentKey ? currentKey + '-' + part : part

        if (currentKey === part) {
          return
        }

        oldKey = toCamelCase(part)

        if (!currentObj[oldKey]) {
          currentObj[oldKey] = {
            value: getValue(dataset[currentKey]),
            child: {},
          }
        }

        currentObj = currentObj[oldKey].child
      })
    })

    return makeNestedOptions(nestedData)
  }

  let options = {}

  const dataset = { ...$element.dataset }

  const datasetKey = toCamelCase(dataAttributeName)

  const datasetValue = dataset[datasetKey]

  // Parse main data if it exists and is not empty
  if (datasetValue && datasetValue.trim()) {
    try {
      options = getJSONData(datasetValue, reviver)
    } catch (error) {
      console.warn(`Failed to parse JSON from ${dataAttributeName}:`, error)
      options = {}
    }
  }

  // Find all override attributes with pattern: data-{dataAttributeName}--key
  const overridePrefix = `${datasetKey}-`

  const overrideAttrs = Object.keys(dataset).filter((key) => {
    return key.startsWith(overridePrefix)
  })

  const overrideOptions = getOverrideOptions(overrideAttrs, dataset)

  // Merge base options with override options (overrides take precedence)
  return deepMerge(defaults, options, overrideOptions)
}

/**
 * Creates plugin instances for selected elements
 * @param {string|HTMLElement|NodeList} selectors - Elements to create plugins for
 * @param {Object} options - Plugin options
 * @param {Function} plugin - Plugin constructor
 * @returns {Array} Array of plugin instances
 */
export function createPluginInstance (selectors, options, plugin) {
  return Array.from(getElements(selectors)).map(element => {
    if (weakMap.has(element)) return weakMap.get(element)

    const instance = new plugin(element, options)
    instance.element = element
    instance.destroy = () => {
      weakMap.delete(element)
      triggerEvent(element, 'destroy')
    }

    weakMap.set(element, instance)
    return instance
  })
}

/**
 * Gets existing plugin instances for selected elements
 * @param {string|HTMLElement|NodeList} selectors - Elements to get plugins for
 * @returns {Array} Array of plugin instances
 */
export function getPluginInstance (selectors) {
  return Array.from(getElements(selectors)).filter(element => weakMap.has(element)).map(element => weakMap.get(element))
}

/**
 * Dispatches a custom event on a target DOM element with optional event details and configuration.
 * Provides a convenient wrapper around the native CustomEvent constructor and dispatchEvent method.
 *
 * @param {HTMLElement|EventTarget} $target - The DOM element or EventTarget to dispatch the event on
 * @param {string} eventType - The name/type of the custom event to dispatch
 * @param {Object} [eventDetails={}] - Data to include in the event's detail property
 * @param {Object} [options={}] - CustomEvent configuration options
 * @param {boolean} [options.bubbles=false] - Whether the event bubbles up through the DOM tree
 * @param {boolean} [options.cancelable=false] - Whether the event can be canceled with preventDefault()
 * @param {boolean} [options.composed=false] - Whether the event will trigger listeners outside of a shadow root
 * @returns {boolean} True if the event was not canceled, false if preventDefault() was called
 * @example
 * // Basic custom event dispatch
 * const button = document.getElementById('my-button');
 *
 * triggerEvent(button, 'customClick', {
 *   timestamp: Date.now(),
 *   userId: 123
 * });
 *
 * // Listen for the custom event
 * button.addEventListener('customClick', (event) => {
 *   console.log('Custom click:', event.detail);
 *   // { timestamp: 1634567890123, userId: 123 }
 * });
 *
 * @example
 * // Event with bubbling enabled
 * const childElement = document.querySelector('.child');
 * const parentElement = document.querySelector('.parent');
 *
 * // Event will bubble up to parent
 * triggerEvent(childElement, 'dataUpdate',
 *   { newValue: 'updated data' },
 *   { bubbles: true }
 * );
 *
 * // Parent can catch the bubbled event
 * parentElement.addEventListener('dataUpdate', (event) => {
 *   console.log('Caught bubbled event:', event.detail.newValue);
 * });
 *
 * @example
 * // Cancelable event with preventDefault check
 * const form = document.querySelector('form');
 *
 * const wasNotCanceled = triggerEvent(form, 'beforeSubmit',
 *   { formData: new FormData(form) },
 *   { cancelable: true, bubbles: true }
 * );
 *
 * if (wasNotCanceled) {
 *   console.log('Event was not canceled, proceed with submit');
 * } else {
 *   console.log('Event was canceled, abort submit');
 * }
 *
 * // Listener that cancels the event
 * form.addEventListener('beforeSubmit', (event) => {
 *   if (!validateForm(event.detail.formData)) {
 *     event.preventDefault(); // Cancel the event
 *   }
 * });
 *
 * @example
 * // Component communication pattern
 * class CustomComponent {
 *   constructor(element) {
 *     this.element = element;
 *   }
 *
 *   updateValue(newValue) {
 *     const oldValue = this.value;
 *     this.value = newValue;
 *
 *     // Notify listeners of the change
 *     triggerEvent(this.element, 'valueChanged', {
 *       oldValue,
 *       newValue,
 *       component: this
 *     }, { bubbles: true });
 *   }
 * }
 *
 * @example
 * // Modal dialog events
 * const modal = document.querySelector('.modal');
 *
 * function openModal() {
 *   // Dispatch opening event (cancelable)
 *   const canOpen = triggerEvent(modal, 'modalOpening',
 *     { timestamp: Date.now() },
 *     { cancelable: true, bubbles: true }
 *   );
 *
 *   if (canOpen) {
 *     modal.classList.add('open');
 *
 *     // Dispatch opened event (non-cancelable)
 *     triggerEvent(modal, 'modalOpened',
 *       { timestamp: Date.now() },
 *       { bubbles: true }
 *     );
 *   }
 * }
 *
 * // Prevent modal from opening under certain conditions
 * modal.addEventListener('modalOpening', (event) => {
 *   if (document.querySelector('.blocking-overlay')) {
 *     event.preventDefault();
 *     console.log('Modal opening prevented');
 *   }
 * });
 *
 * @example
 * // Cross-component event system
 * const eventBus = document.body; // Use body as event bus
 *
 * // Component A dispatches events
 * function componentAAction() {
 *   triggerEvent(eventBus, 'userAction', {
 *     action: 'buttonClick',
 *     componentId: 'componentA',
 *     data: { userId: getCurrentUserId() }
 *   }, { bubbles: true });
 * }
 *
 * // Component B listens for events
 * eventBus.addEventListener('userAction', (event) => {
 *   const { action, componentId, data } = event.detail;
 *
 *   if (componentId !== 'componentB') {
 *     updateComponentB(action, data);
 *   }
 * });
 *
 * @example
 * // Web Components custom events
 * class MyWebComponent extends HTMLElement {
 *   connectedCallback() {
 *     this.addEventListener('click', this.handleClick.bind(this));
 *   }
 *
 *   handleClick() {
 *     triggerEvent(this, 'my-component-clicked', {
 *       elementId: this.id,
 *       timestamp: Date.now(),
 *       position: this.getBoundingClientRect()
 *     }, {
 *       bubbles: true,
 *       composed: true // Allow event to cross shadow DOM boundary
 *     });
 *   }
 * }
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent CustomEvent API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent dispatchEvent API
 */
export function triggerEvent ($target, eventType, eventDetails = {}, options = {}) {

  const defaultOptions = { bubbles: false, cancelable: false, composed: false }
  const availableOptions = { ...defaultOptions, ...options }

  return $target.dispatchEvent(new CustomEvent(eventType, {
    ...availableOptions,
    detail: {
      ...eventDetails,
    },
  }))
}

/**
 * Attaches swipe gesture detection to a DOM element, supporting both touch and pointer events.
 * Automatically registers event listeners and provides directional swipe detection with customizable offset.
 *
 * @param {HTMLElement} target - The DOM element to attach swipe detection to
 * @param {Function} listenerFn - Callback function that handles swipe events
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.offset=10] - Minimum pixel distance to register a directional swipe
 * @param {boolean} [options.touchOnly=false] - If true, only listen for touch events (ignore pointer/mouse)
 * @returns {Function} A cleanup function to remove all event listeners and abort the controller
 *
 * @example
 * // Basic swipe detection on a div element
 * const swipeArea = document.getElementById('swipe-area');
 *
 * const cleanup = swipeEvent(swipeArea, (event) => {
 *   const { detail } = event;
 *
 *   if (detail.done) {
 *     if (detail.left) console.log('Swiped left!');
 *     if (detail.right) console.log('Swiped right!');
 *     if (detail.top) console.log('Swiped up!');
 *     if (detail.bottom) console.log('Swiped down!');
 *   }
 * });
 *
 * // Clean up when done
 * // cleanup();
 *
 * @example
 * // Custom offset for more sensitive detection
 * const sensitiveSwipe = swipeEvent(element, (event) => {
 *   const { detail } = event;
 *   console.log(`Swipe distance: x=${detail.x}, y=${detail.y}`);
 * }, { offset: 5 }); // Only need 5px to trigger direction
 *
 * @example
 * // Touch-only mode (no mouse/pointer support)
 * const touchOnlySwipe = swipeEvent(mobileElement, (event) => {
 *   const { detail } = event;
 *
 *   if (detail.moving) {
 *     // Live tracking during swipe
 *     updateUI(detail.x, detail.y);
 *   }
 *
 *   if (detail.done) {
 *     // Final swipe result
 *     handleSwipeComplete(detail);
 *   }
 * }, { touchOnly: true });
 *
 * @example
 * // Image carousel with swipe navigation
 * const carousel = document.querySelector('.carousel');
 * let currentSlide = 0;
 *
 * swipeEvent(carousel, (event) => {
 *   const { detail } = event;
 *
 *   if (detail.done) {
 *     if (detail.left && currentSlide < maxSlides - 1) {
 *       currentSlide++;
 *       showSlide(currentSlide);
 *     } else if (detail.right && currentSlide > 0) {
 *       currentSlide--;
 *       showSlide(currentSlide);
 *     }
 *   }
 * });
 *
 * @example
 * // Card swipe with visual feedback during gesture
 * const card = document.querySelector('.swipe-card');
 *
 * swipeEvent(card, (event) => {
 *   const { detail } = event;
 *
 *   if (detail.moving) {
 *     // Provide visual feedback during swipe
 *     card.style.transform = `translateX(${detail.x}px) rotateZ(${detail.x * 0.1}deg)`;
 *
 *     // Change color based on direction
 *     if (detail.left) card.classList.add('reject-hint');
 *     if (detail.right) card.classList.add('accept-hint');
 *   }
 *
 *   if (detail.done) {
 *     if (Math.abs(detail.x) > 100) {
 *       // Complete the action if swipe was far enough
 *       detail.left ? rejectCard() : acceptCard();
 *     } else {
 *       // Snap back if swipe wasn't far enough
 *       card.style.transform = '';
 *       card.classList.remove('reject-hint', 'accept-hint');
 *     }
 *   }
 * }, { offset: 20 });
 *
 * @example
 * // Cleanup in React useEffect
 * useEffect(() => {
 *   const element = elementRef.current;
 *   if (!element) return;
 *
 *   const cleanup = swipeEvent(element, handleSwipe, { offset: 15 });
 *
 *   return cleanup; // Cleanup function returned by swipeEvent
 * }, []);
 *
 *
 * @description
 * The swipe event detail object contains:
 * - `x` {number} - Horizontal distance from start position
 * - `y` {number} - Vertical distance from start position
 * - `left` {boolean} - True if swiping left beyond offset threshold
 * - `right` {boolean} - True if swiping right beyond offset threshold
 * - `top` {boolean} - True if swiping up beyond offset threshold
 * - `bottom` {boolean} - True if swiping down beyond offset threshold
 * - `moving` {boolean} - True during active swipe, false when completed
 * - `done` {boolean} - True when swipe gesture is complete
 */

export function swipeEvent (target, listenerFn, options = {}) {
  let readyToMove = false
  let isMoved = false
  let xStart = 0
  let yStart = 0
  let isTouchEvent = false
  const defaults = { offset: 10, touchOnly: false }
  const settings = { ...defaults, ...options }
  const controller = new AbortController()
  const { signal } = controller

  const start = (event) => {
    readyToMove = true
    isMoved = false

    xStart = event.x
    yStart = event.y
    isTouchEvent = event.type === 'touchstart'

    if (event.type === 'pointerdown' && isTouchEvent) {
      return false
    }

    if (isTouchEvent) {
      const { clientX, clientY } = event.changedTouches[0]
      xStart = clientX
      yStart = clientY
    }
  }

  const move = (event) => {
    if (!readyToMove) {
      return
    }

    if (event.type === 'pointermove' && isTouchEvent) {
      return false
    }

    let horizontalDiff = event.x - xStart
    let verticalDiff = event.y - yStart

    if (isTouchEvent) {
      const touch = event.changedTouches[0]
      horizontalDiff = touch.clientX - xStart
      verticalDiff = touch.clientY - yStart
    }

    isMoved = true

    const details = {
      x: horizontalDiff,
      y: verticalDiff,
      top: verticalDiff + settings.offset < 0, // to top
      bottom: verticalDiff - settings.offset > 0, // to bottom
      left: horizontalDiff + settings.offset < 0, // to left
      right: horizontalDiff - settings.offset > 0, // to right
      moving: true,
      done: false,
    }

    triggerEvent(target, 'swipe', details)
  }

  const end = (event) => {
    if (!readyToMove) {
      return
    }

    const isPointerEvent =
      event.type === 'pointerleave' || event.type === 'pointerup'

    if (isPointerEvent && isTouchEvent) {
      return false
    }

    let horizontalDiff = event.x - xStart
    let verticalDiff = event.y - yStart

    if (isTouchEvent) {
      const { clientX, clientY } = event.changedTouches[0]
      horizontalDiff = clientX - xStart
      verticalDiff = clientY - yStart
    }

    if (isMoved) {
      const details = {
        x: horizontalDiff,
        y: verticalDiff,
        top: verticalDiff + settings.offset < 0, // to top
        bottom: verticalDiff - settings.offset > 0, // to bottom
        left: horizontalDiff + settings.offset < 0, // to left
        right: horizontalDiff - settings.offset > 0, // to right
        moving: false,
        done: true,
      }

      triggerEvent(target, 'swipe', details)
    }

    isMoved = false
    isTouchEvent = false
    readyToMove = false
  }

  const unregister = () => {
    controller.abort()
  }

  const register = () => {
    target.addEventListener('touchstart', start, { passive: true, signal })
    target.addEventListener('touchmove', move, { passive: true, signal })
    target.addEventListener('touchend', end, { passive: true, signal })
    target.addEventListener('touchcancel', end, { signal })

    if (!settings.touchOnly) {
      target.addEventListener('pointerdown', start, { signal })
      target.addEventListener('pointermove', move, { signal })
      target.addEventListener('pointerup', end, { signal })
      target.addEventListener('pointerleave', end, { signal })
    }

    target.addEventListener('swipe', listenerFn, { signal })

    return unregister
  }

  return register()
}

/**
 *  Creates a promise that resolves after a specified delay with optional data.
 *  Useful for adding delays in async/await code, testing timeouts, or creating
 *  artificial delays in processing without blocking the UI thread.
 *
 * @param {number} milliseconds - The number of milliseconds to wait before resolving
 * @param {*} [data={}] - Optional data to resolve with after the delay
 * @returns {Promise<*>} A promise that resolves after the specified duration
 *
 * @example
 * // Basic usage - wait 1 second
 * await waitAsync(1000);
 * console.log('1 second has passed');
 *
 * @example
 * // Wait with data
 * const result = await waitAsync(500, { message: 'Hello World' });
 * console.log(result); // { message: 'Hello World' }
 *
 * @example
 * // Wait with primitive data
 * const number = await waitAsync(1500, 42);
 * console.log(number); // 42
 *
 * @example
 * // Use in a loop with delay
 * for (let i = 0; i < 3; i++) {
 *   console.log(`Step ${i + 1}`);
 *   await waitAsync(1000, `Completed step ${i + 1}`);
 * }
 *
 * @example
 * // Simulate API delay in testing
 * async function mockApiCall() {
 *   await waitAsync(2000); // Simulate 2-second API response time
 *   return { status: 'success', data: 'API response' };
 * }
 *
 * @example
 * // Chain with other async operations
 * const processWithDelay = async (data) => {
 *   console.log('Processing started...');
 *   const processed = await waitAsync(1000, data.toUpperCase());
 *   console.log('Processing completed');
 *   return processed;
 * };
 *
 * const result = await processWithDelay('hello');
 * console.log(result); // 'HELLO'
 */
export function testWaitAsync (milliseconds, data = {}) {
  return new Promise(resolve => setTimeout(() => resolve(data), milliseconds))
}

/**
 * Synchronously waits for the specified duration, blocking the UI thread.
 * This function uses a busy-wait loop that will block the current thread and consume CPU cycles.
 * WARNING: This will freeze the UI during execution.
 *
 * @param {number} milliseconds - The number of milliseconds to block execution.
 * @param {*} [data={}] - Optional data to return after the delay.
 * @returns {*} The provided data after the synchronous delay
 *
 * @example
 * // Basic usage - block for 1 second (⚠️ blocks everything!)
 * console.log('Before wait');
 * waitSync(1000);
 * console.log('After wait - 1 second later');
 *
 * @example
 * // Return data after blocking
 * const result = waitSync(500, { message: 'Delayed data' });
 * console.log(result); // { message: 'Delayed data' }
 *
 * @example
 * // Use with primitive data
 * const number = waitSync(300, 42);
 * console.log(number); // 42
 *
 * @example
 * // Timing critical operations (rare use case)
 * function preciseTiming() {
 *   const start = performance.now();
 *   waitSync(100); // Precise 100ms delay
 *   const end = performance.now();
 *   console.log(`Actual delay: ${end - start}ms`);
 * }
 *
 * @example
 * // Testing synchronous behavior (not recommended for production)
 * function testSyncBehavior() {
 *   console.log('Step 1');
 *   waitSync(1000, 'step1-complete');
 *   console.log('Step 2'); // This won't execute until after the full delay
 *   return 'all-complete';
 * }
 *
 * @example
 * // CPU-intensive alternative that shows the blocking nature
 * console.log('UI will freeze during this:');
 * waitSync(3000); // ⚠️ Browser UI will be completely unresponsive
 * console.log('UI unfrozen now');
 *
 */
export function testWaitSync (milliseconds, data = {}) {
  const start = Date.now()
  while (Date.now() - start < milliseconds) {}
  return data
}