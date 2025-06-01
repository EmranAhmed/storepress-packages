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
 * Parses options from a data attribute
 * @param {HTMLElement} element - DOM element containing the attributes
 * @param {string} attributeName - Name of the attribute to parse
 * @returns {Object} Parsed options object
 */
export function getOptionsFromAttribute (element, attributeName) {

  const attributeKey = toCamelCase(attributeName)

  const attributeSubKey = `${attributeKey}-`

  const dataset = { ...element.dataset }

  // const settings = dataset[attributeKey] ? dataset[attributeKey].replace(/\'/g, '"') : '{}'
  const settings = dataset[attributeKey] ? dataset[attributeKey].replace(/\'/g, '"').replace(/\\/g, '\\\\') : '{}';

  const boolValues = ['true', 'TRUE', 'false', 'FALSE', 'yes', 'YES', 'no', 'NO', 'y', 'Y', 'n', 'N']

  const truthyValues = ['true', 'TRUE', 'yes', 'YES', 'y', 'Y']

  try {
    const data = JSON.parse(settings)

    const overrideAttrs = Object.keys(dataset).filter((key) => {
      return key.startsWith(attributeSubKey)
    })

    const override = overrideAttrs.reduce((options, key) => {

      const settingKey = toCamelCase(key.replace(attributeSubKey, ''))
      const rawValue = element.dataset[key]

      const isBool = boolValues.includes(rawValue)
      const isJSON = rawValue.charAt(0) === '{'
      const isNumber = isNaN(Number(rawValue)) === false
      options[settingKey] = rawValue
      if (isJSON) {
        options[settingKey] = JSON.parse(rawValue)
      }
      if (isNumber) {
        options[settingKey] = Number(rawValue)
      }
      if (isBool) {
        options[settingKey] = truthyValues.includes(rawValue)
      }

      return options

    }, {})

    return {
      ...data,
      ...override,
    }
  } catch (error) {
    // {'a': 'AAA', 'b': 'BBB'} == valid
    // {a: 'AAA', b: 'BBB'} == Invalid. Key should wrap with single (') or double (") quotes.
    window.console.warn('Seems your settings attribute is not valid JSON. Please wrap keys with quotes.\n\n', error)
    return {}
  }
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
 * Trigger Custom Event.
 *
 * @param {Element|Document} target - HTML Element.
 * @param {string}  eventType   - Callback Function Handler
 * @param {Object}  eventDetails - Pass Event details to use on event listener function.
 * @param {{ bubbles: boolean, cancelable: boolean, composed: boolean }}  options - Pass Event options Default: { bubbles: boolean, cancelable: boolean, composed: boolean }.
 * @return {boolean} - Dispatched event return.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
export function triggerEvent (target, eventType, eventDetails = {}, options = {}) {

  const defaultOptions = { bubbles: false, cancelable: false, composed: false }
  const availableOptions = { ...defaultOptions, ...options }

  return target.dispatchEvent(new CustomEvent(eventType, {
    ...availableOptions,
    detail: {
      ...eventDetails,
    },
  }))
}

/**
 * @typedef {Object} SwipeOptions
 * @property {number} [offset=10] - Minimum distance to trigger swipe detection
 * @property {boolean} [touchOnly=false] - Whether to listen for touch events only
 */

/**
 * Creates a swipe event handler for an element with support for both touch and pointer events.
 *
 * @param {HTMLElement} target - Element to attach swipe detection to
 * @param {function(CustomEvent)} listenerFn - Callback function for swipe events
 * @param {SwipeOptions} [options={}] - Configuration options
 * @returns {function(): void} Cleanup function to remove event listeners
 *
 * @example
 * const element = document.getElementById('swipeArea');
 * const cleanup = swipeEvent(element, (e) => {
 *   if (e.detail.right) console.log('Swiped right!');
 * });
 *
 * // Later: cleanup();
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
 * Asynchronously waits for the specified duration without blocking the UI thread.
 * Uses setTimeout internally to create a non-blocking delay.
 *
 * @param {number} milliseconds - The duration to wait in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified duration
 *
 * @example
 * // Wait for 2 seconds asynchronously
 * await waitAsync(2000);
 * console.log('Continued after 2 seconds without blocking UI');
 *
 * @example
 * // Using in an async function
 * async function example() {
 *   console.log('Starting');
 *   await waitAsync(1000);
 *   console.log('1 second passed');
 * }
 */
export function waitAsync (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Synchronously waits for the specified duration, blocking the UI thread.
 * Uses a busy-wait loop to create a blocking delay.
 * WARNING: This will freeze the UI during execution.
 *
 * @param {number} milliseconds - The duration to wait in milliseconds
 * @returns {void}
 *
 * @example
 * // Wait for 2 seconds synchronously (NOT RECOMMENDED)
 * waitSync(2000);
 * console.log('Continued after 2 seconds of blocking');
 *
 * @throws {Error} Implicitly may throw if milliseconds is negative or non-numeric
 * @warning This function blocks the main thread and should be used with extreme caution
 */
export function waitSync (milliseconds) {
  const start = Date.now()
  while (Date.now() - start < milliseconds) {}
}