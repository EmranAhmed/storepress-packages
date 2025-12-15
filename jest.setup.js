/**
 * Global Jest setup for StorePress Packages
 * Runs before each test file across all packages
 *
 * @package storepress-packages
 */

// Import jest-dom for extended DOM matchers
import '@testing-library/jest-dom'

/**
 * Mock ResizeObserver
 * Not available in jsdom
 */
global.ResizeObserver = class ResizeObserver {
  constructor (callback) {
    this.callback = callback
  }

  observe () {}

  unobserve () {}

  disconnect () {}
}

/**
 * Mock IntersectionObserver
 * Not available in jsdom
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor (callback) {
    this.callback = callback
  }

  observe () {}

  unobserve () {}

  disconnect () {}
}

/**
 * Mock window.matchMedia
 * Used by WordPress components for responsive behavior
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

/**
 * Mock scrollTo
 * Not implemented in jsdom
 */
window.scrollTo = jest.fn()
Element.prototype.scrollTo = jest.fn()
Element.prototype.scrollIntoView = jest.fn()

/**
 * Mock requestAnimationFrame
 */
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

/**
 * Suppress React 18 console warnings in tests
 */
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalError.call(console, ...args)
}

/**
 * Polyfill for PointerEvent (not available in jsdom)
 */
if (typeof PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    constructor (type, params = {}) {
      super(type, params)
      this.pointerId = params.pointerId || 0
      this.width = params.width || 0
      this.height = params.height || 0
      this.pressure = params.pressure || 0
      this.tangentialPressure = params.tangentialPressure || 0
      this.tiltX = params.tiltX || 0
      this.tiltY = params.tiltY || 0
      this.twist = params.twist || 0
      this.pointerType = params.pointerType || ''
      this.isPrimary = params.isPrimary || false
    }
  }

  global.PointerEvent = PointerEvent
}

/**
 * Polyfill for TouchEvent (not available in jsdom)
 */
if (typeof TouchEvent === 'undefined') {
  class Touch {
    constructor (params = {}) {
      this.identifier = params.identifier || 0
      this.target = params.target || null
      this.clientX = params.clientX || 0
      this.clientY = params.clientY || 0
      this.screenX = params.screenX || 0
      this.screenY = params.screenY || 0
      this.pageX = params.pageX || 0
      this.pageY = params.pageY || 0
    }
  }

  class TouchEvent extends UIEvent {
    constructor (type, params = {}) {
      super(type, params)
      this.touches = params.touches || []
      this.targetTouches = params.targetTouches || []
      this.changedTouches = params.changedTouches || []
      this.ctrlKey = params.ctrlKey || false
      this.shiftKey = params.shiftKey || false
      this.altKey = params.altKey || false
      this.metaKey = params.metaKey || false
    }
  }

  global.Touch = Touch
  global.TouchEvent = TouchEvent
}

// Reset DOM between tests
beforeEach(() => {
  // Clear the document body
  document.body.innerHTML = ''

  // Reset StorePress global namespace
  delete window.StorePress
})

// Clean up after all tests
afterEach(() => {
  // Clear any pending timers
  jest.clearAllTimers()
})

// Custom Jest matchers
expect.extend({
  /**
   * Check if value is a RegExp instance
   *
   * @example
   * expect(/test/i).toBeRegExp();
   */
  toBeRegExp (received) {
    const pass = received instanceof RegExp
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a RegExp`
          : `expected ${received} to be a RegExp`,
    }
  },

  /**
   * Check if element has specific CSS class
   *
   * @example
   * expect(element).toHaveClass('active');
   */
  toHaveClass (received, className) {
    const pass =
      received instanceof HTMLElement &&
      received.classList.contains(className)
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
    }
  },

  /**
   * Check if element has specific attribute value
   *
   * @example
   * expect(element).toHaveAttribute('data-id', '123');
   */
  toHaveAttribute (received, attrName, expectedValue) {
    if (!(received instanceof HTMLElement)) {
      return {
        pass: false,
        message: () => `expected ${received} to be an HTMLElement`,
      }
    }

    const actualValue = received.getAttribute(attrName)
    const hasAttr = received.hasAttribute(attrName)

    if (expectedValue === undefined) {
      return {
        pass: hasAttr,
        message: () =>
          hasAttr
            ? `expected element not to have attribute "${attrName}"`
            : `expected element to have attribute "${attrName}"`,
      }
    }

    const pass = actualValue === expectedValue
    return {
      pass,
      message: () =>
        pass
          ? `expected attribute "${attrName}" not to be "${expectedValue}"`
          : `expected attribute "${attrName}" to be "${expectedValue}", but got "${actualValue}"`,
    }
  },

  /**
   * Check if WeakMap/Map is empty
   *
   * @example
   * expect(myMap).toBeEmpty();
   */
  toBeEmpty (received) {
    let pass = false

    if (received instanceof Map || received instanceof Set) {
      pass = received.size === 0
    } else if (Array.isArray(received)) {
      pass = received.length === 0
    } else if (typeof received === 'object' && received !== null) {
      pass = Object.keys(received).length === 0
    }

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be empty`
          : `expected ${received} to be empty`,
    }
  },
})

// Global test utilities
global.createTestElement = (html) => {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  return container.firstElementChild
}

global.createTestElements = (html) => {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  return container.children
}