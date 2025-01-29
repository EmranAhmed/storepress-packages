const weakMap = new WeakMap()

export function getElement (selector) {

  // empty
  if (!selector) {
    return null
  }

  // querySelector
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }

  // HTMLElement
  if (selector instanceof window.HTMLElement) {
    return selector
  }
  return selector
}

export function getElements (selectors) {

  // empty
  if (!selectors) {
    return []
  }

  // querySelectorAll
  if (typeof selectors === 'string') {
    return document.querySelectorAll(selectors)
  }

  // HTMLElements
  if (selectors instanceof window.HTMLElement) {
    return [selectors]
  }
  return selectors
}

export function toCamelCase (string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2) => {
    if (p2) return p2.toUpperCase()
    return p1.toLowerCase()
  })
}

export function toUpperCamelCase (string) {
  return string.replace(/^([a-z])|[\s-_](\w)/g, (match, p1, p2) => {
    if (p2) return p2.toUpperCase()
    return p1.toUpperCase()
  })
}

/**
 * Get Option from HTML Attribute
 *
 * @param {Element} element         - HTML Element.
 * @param {string}  attributeName   - Attribute Name
 * @return {Object}                 - Return Object.
 */
export function getOptionsFromAttribute (element, attributeName) {

  const attributeKey = toCamelCase(attributeName)

  const attributeSubKey = `${attributeKey}-`

  const dataset = { ...element.dataset }

  const settings = dataset[attributeKey] ? dataset[attributeKey].replace(/\'/g, '"') : '{}'

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

export function createPluginInstance (selectors, options, plugin) {
  const elements = getElements(selectors)
  const instances = []
  for (const element of elements) {
    let instance = weakMap.get(element)
    if (!weakMap.has(element)) {
      instance = new plugin(element, options)
      instance.element = element
      instance.destroy = () => {
        weakMap.delete(element)
        triggerEvent(element, 'destroy')
      }
      weakMap.set(element, instance)
    }
    instances.push(instance)
  }
  return instances
}

export function getPluginInstance (selectors) {
  const elements = getElements(selectors)
  const instances = []

  if (elements.length === 0) {
    return instances
  }

  for (const element of elements) {
    if (weakMap.has(element)) {
      const instance = weakMap.get(element)
      instances.push(instance)
    }
  }
  return instances
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
 * @typedef {Function} unregister
 */
/**
 * Swipe Event.
 *
 * @param {Element|Document}                     target     - HTML Element.
 * @param {function(event):void}                 listenerFn - Callback Function Handler
 * @param {{offset: number, touchOnly: boolean}} options    - Options.
 * @return {unregister} - Return `unregister` function for cleanup events.
 */
export function swipeEvent (target, listenerFn, options = {}) {
  let readyToMove = false
  let isMoved = false
  let xStart = 0
  let yStart = 0
  let isTouchEvent = false
  const defaults = { offset: 10, touchOnly: false }
  const settings = { ...defaults, ...options }

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
    target.removeEventListener('touchstart', start)
    target.removeEventListener('touchmove', move)
    target.removeEventListener('touchend', end)
    target.removeEventListener('touchcancel', end)

    if (!settings.touchOnly) {
      target.removeEventListener('pointerdown', start)
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointerleave', end)
    }

    target.removeEventListener('swipe', listenerFn)
  }

  const register = () => {
    target.addEventListener('touchstart', start, { passive: true })
    target.addEventListener('touchmove', move, { passive: true })
    target.addEventListener('touchend', end, { passive: true })
    target.addEventListener('touchcancel', end)

    if (!settings.touchOnly) {
      target.addEventListener('pointerdown', start)
      target.addEventListener('pointermove', move)
      target.addEventListener('pointerup', end)
      target.addEventListener('pointerleave', end)
    }

    target.addEventListener('swipe', listenerFn)

    return unregister
  }

  return register()
}