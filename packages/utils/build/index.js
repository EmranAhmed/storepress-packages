"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPluginInstance = createPluginInstance;
exports.getElement = getElement;
exports.getElements = getElements;
exports.getOptionsFromAttribute = getOptionsFromAttribute;
exports.getPluginInstance = getPluginInstance;
exports.swipeEvent = swipeEvent;
exports.toCamelCase = toCamelCase;
exports.toUpperCamelCase = toUpperCamelCase;
exports.triggerEvent = triggerEvent;
exports.waitAsync = waitAsync;
exports.waitSync = waitSync;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * WeakMap to store plugin instances associated with DOM elements
 * @type {WeakMap<HTMLElement, any>}
 */
var weakMap = new WeakMap();

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
function getElement() {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  if (null === selector) return null;
  if (typeof selector === 'string') return document.querySelector(selector);
  return selector instanceof HTMLElement ? selector : null;
}

/**
 * Gets multiple DOM elements based on the provided selector
 * @param {string|HTMLElement|NodeList|Array<HTMLElement>} [selectors=[]] - CSS selector string, HTMLElement, or NodeList
 * @returns {NodeList|Array<HTMLElement>} Array of found elements or empty array
 */
function getElements() {
  var selectors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  if (selectors.length === 0) return [];
  if (typeof selectors === 'string') return document.querySelectorAll(selectors);
  return selectors instanceof HTMLElement ? [selectors] : selectors;
}

/**
 * Converts a string to camelCase
 * @param {string} string - String to convert
 * @returns {string} Converted camelCase string
 */
function toCamelCase(string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

/**
 * Converts a string to PascalCase (UpperCamelCase)
 * @param {string} string - String to convert
 * @returns {string} Converted PascalCase string
 */
function toUpperCamelCase(string) {
  return string.replace(/^([a-z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toUpperCase();
  });
}

/**
 * Parses options from a data attribute
 * @param {HTMLElement} element - DOM element containing the attributes
 * @param {string} attributeName - Name of the attribute to parse
 * @returns {Object} Parsed options object
 */
function getOptionsFromAttribute(element, attributeName) {
  var attributeKey = toCamelCase(attributeName);
  var attributeSubKey = "".concat(attributeKey, "-");
  var dataset = _objectSpread({}, element.dataset);
  var settings = dataset[attributeKey] ? dataset[attributeKey].replace(/\'/g, '"') : '{}';
  var boolValues = ['true', 'TRUE', 'false', 'FALSE', 'yes', 'YES', 'no', 'NO', 'y', 'Y', 'n', 'N'];
  var truthyValues = ['true', 'TRUE', 'yes', 'YES', 'y', 'Y'];
  try {
    var data = JSON.parse(settings);
    var overrideAttrs = Object.keys(dataset).filter(function (key) {
      return key.startsWith(attributeSubKey);
    });
    var override = overrideAttrs.reduce(function (options, key) {
      var settingKey = toCamelCase(key.replace(attributeSubKey, ''));
      var rawValue = element.dataset[key];
      var isBool = boolValues.includes(rawValue);
      var isJSON = rawValue.charAt(0) === '{';
      var isNumber = isNaN(Number(rawValue)) === false;
      options[settingKey] = rawValue;
      if (isJSON) {
        options[settingKey] = JSON.parse(rawValue);
      }
      if (isNumber) {
        options[settingKey] = Number(rawValue);
      }
      if (isBool) {
        options[settingKey] = truthyValues.includes(rawValue);
      }
      return options;
    }, {});
    return _objectSpread(_objectSpread({}, data), override);
  } catch (error) {
    // {'a': 'AAA', 'b': 'BBB'} == valid
    // {a: 'AAA', b: 'BBB'} == Invalid. Key should wrap with single (') or double (") quotes.
    window.console.warn('Seems your settings attribute is not valid JSON. Please wrap keys with quotes.\n\n', error);
    return {};
  }
}

/**
 * Creates plugin instances for selected elements
 * @param {string|HTMLElement|NodeList} selectors - Elements to create plugins for
 * @param {Object} options - Plugin options
 * @param {Function} plugin - Plugin constructor
 * @returns {Array} Array of plugin instances
 */
function createPluginInstance(selectors, options, plugin) {
  return Array.from(getElements(selectors)).map(function (element) {
    if (weakMap.has(element)) return weakMap.get(element);
    var instance = new plugin(element, options);
    instance.element = element;
    instance.destroy = function () {
      weakMap["delete"](element);
      triggerEvent(element, 'destroy');
    };
    weakMap.set(element, instance);
    return instance;
  });
}

/**
 * Gets existing plugin instances for selected elements
 * @param {string|HTMLElement|NodeList} selectors - Elements to get plugins for
 * @returns {Array} Array of plugin instances
 */
function getPluginInstance(selectors) {
  return Array.from(getElements(selectors)).filter(function (element) {
    return weakMap.has(element);
  }).map(function (element) {
    return weakMap.get(element);
  });
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
function triggerEvent(target, eventType) {
  var eventDetails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var defaultOptions = {
    bubbles: false,
    cancelable: false,
    composed: false
  };
  var availableOptions = _objectSpread(_objectSpread({}, defaultOptions), options);
  return target.dispatchEvent(new CustomEvent(eventType, _objectSpread(_objectSpread({}, availableOptions), {}, {
    detail: _objectSpread({}, eventDetails)
  })));
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
function swipeEvent(target, listenerFn) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var readyToMove = false;
  var isMoved = false;
  var xStart = 0;
  var yStart = 0;
  var isTouchEvent = false;
  var defaults = {
    offset: 10,
    touchOnly: false
  };
  var settings = _objectSpread(_objectSpread({}, defaults), options);
  var controller = new AbortController();
  var signal = controller.signal;
  var start = function start(event) {
    readyToMove = true;
    isMoved = false;
    xStart = event.x;
    yStart = event.y;
    isTouchEvent = event.type === 'touchstart';
    if (event.type === 'pointerdown' && isTouchEvent) {
      return false;
    }
    if (isTouchEvent) {
      var _event$changedTouches = event.changedTouches[0],
        clientX = _event$changedTouches.clientX,
        clientY = _event$changedTouches.clientY;
      xStart = clientX;
      yStart = clientY;
    }
  };
  var move = function move(event) {
    if (!readyToMove) {
      return;
    }
    if (event.type === 'pointermove' && isTouchEvent) {
      return false;
    }
    var horizontalDiff = event.x - xStart;
    var verticalDiff = event.y - yStart;
    if (isTouchEvent) {
      var touch = event.changedTouches[0];
      horizontalDiff = touch.clientX - xStart;
      verticalDiff = touch.clientY - yStart;
    }
    isMoved = true;
    var details = {
      x: horizontalDiff,
      y: verticalDiff,
      top: verticalDiff + settings.offset < 0,
      // to top
      bottom: verticalDiff - settings.offset > 0,
      // to bottom
      left: horizontalDiff + settings.offset < 0,
      // to left
      right: horizontalDiff - settings.offset > 0,
      // to right
      moving: true,
      done: false
    };
    triggerEvent(target, 'swipe', details);
  };
  var end = function end(event) {
    if (!readyToMove) {
      return;
    }
    var isPointerEvent = event.type === 'pointerleave' || event.type === 'pointerup';
    if (isPointerEvent && isTouchEvent) {
      return false;
    }
    var horizontalDiff = event.x - xStart;
    var verticalDiff = event.y - yStart;
    if (isTouchEvent) {
      var _event$changedTouches2 = event.changedTouches[0],
        clientX = _event$changedTouches2.clientX,
        clientY = _event$changedTouches2.clientY;
      horizontalDiff = clientX - xStart;
      verticalDiff = clientY - yStart;
    }
    if (isMoved) {
      var details = {
        x: horizontalDiff,
        y: verticalDiff,
        top: verticalDiff + settings.offset < 0,
        // to top
        bottom: verticalDiff - settings.offset > 0,
        // to bottom
        left: horizontalDiff + settings.offset < 0,
        // to left
        right: horizontalDiff - settings.offset > 0,
        // to right
        moving: false,
        done: true
      };
      triggerEvent(target, 'swipe', details);
    }
    isMoved = false;
    isTouchEvent = false;
    readyToMove = false;
  };
  var unregister = function unregister() {
    controller.abort();
  };
  var register = function register() {
    target.addEventListener('touchstart', start, {
      passive: true,
      signal: signal
    });
    target.addEventListener('touchmove', move, {
      passive: true,
      signal: signal
    });
    target.addEventListener('touchend', end, {
      passive: true,
      signal: signal
    });
    target.addEventListener('touchcancel', end, {
      signal: signal
    });
    if (!settings.touchOnly) {
      target.addEventListener('pointerdown', start, {
        signal: signal
      });
      target.addEventListener('pointermove', move, {
        signal: signal
      });
      target.addEventListener('pointerup', end, {
        signal: signal
      });
      target.addEventListener('pointerleave', end, {
        signal: signal
      });
    }
    target.addEventListener('swipe', listenerFn, {
      signal: signal
    });
    return unregister;
  };
  return register();
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
function waitAsync(milliseconds) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, milliseconds);
  });
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
function waitSync(milliseconds) {
  var start = Date.now();
  while (Date.now() - start < milliseconds) {}
}