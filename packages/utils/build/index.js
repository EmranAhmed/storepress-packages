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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var weakMap = new WeakMap();
function getElement(selector) {
  // empty
  if (!selector) {
    return null;
  }

  // querySelector
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }

  // HTMLElement
  if (selector instanceof window.HTMLElement) {
    return selector;
  }
  return selector;
}
function getElements(selectors) {
  // empty
  if (!selectors) {
    return [];
  }

  // querySelectorAll
  if (typeof selectors === 'string') {
    return document.querySelectorAll(selectors);
  }

  // HTMLElements
  if (selectors instanceof window.HTMLElement) {
    return [selectors];
  }
  return selectors;
}
function toCamelCase(string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}
function toUpperCamelCase(string) {
  return string.replace(/^([a-z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toUpperCase();
  });
}
function getOptionsFromAttribute(element, attributeName) {
  var overrideKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var attributeKey = toCamelCase(attributeName);
  var rawSettings = element.dataset[attributeKey]; // undefined if not found

  if (!rawSettings) {
    return {};
  }
  var settings = rawSettings.replace(/\'/g, '"');
  try {
    var data = JSON.parse(settings);
    var boolValues = ['true', 'TRUE', 'false', 'FALSE', 'yes', 'YES', 'no', 'NO', 'y', 'Y', 'n', 'N'];
    var truthyValues = ['true', 'TRUE', 'yes', 'YES', 'y', 'Y'];
    var override = overrideKeys.reduce(function (values, current) {
      var settingKey = toCamelCase(current);
      var valueKey = toUpperCamelCase(current);
      var dataKey = "".concat(attributeKey, "-").concat(valueKey);
      var rawValue = element.dataset[dataKey]; // undefined if not found

      if (rawValue) {
        var isBool = boolValues.includes(rawValue);
        var isJSON = rawValue.charAt(0) === '{';
        var isNumber = isNaN(Number(rawValue)) === false;
        values[settingKey] = rawValue;
        if (isJSON) {
          values[settingKey] = JSON.parse(rawValue);
        }
        if (isNumber) {
          values[settingKey] = Number(rawValue);
        }
        if (isBool) {
          values[settingKey] = truthyValues.includes(rawValue);
        }
      }
      return values;
    }, {});
    return _objectSpread(_objectSpread({}, data), override);
  } catch (error) {
    // {'a': 'AAA', 'b': 'BBB'} == valid
    // {a: 'AAA', b: 'BBB'} == Invalid. Key should wrap with single (') or double (") quotes.
    window.console.warn('Seems your settings attribute is not valid JSON. Please wrap keys with quotes.\n\n', error);
    return {};
  }
}
function createPluginInstance(selectors, options, plugin) {
  var elements = getElements(selectors);
  var instances = [];
  var _iterator = _createForOfIteratorHelper(elements),
    _step;
  try {
    var _loop = function _loop() {
      var element = _step.value;
      var instance = weakMap.get(element);
      if (!weakMap.has(element)) {
        instance = new plugin(element, options);
        instance.element = element;
        instance.destroy = function () {
          weakMap["delete"](element);
          element.dispatchEvent(new Event('destroy'));
        };
        weakMap.set(element, instance);
      }
      instances.push(instance);
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return instances;
}
function getPluginInstance(selectors) {
  var elements = getElements(selectors);
  var instances = [];
  if (elements.length === 0) {
    return instances;
  }
  var _iterator2 = _createForOfIteratorHelper(elements),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var element = _step2.value;
      if (weakMap.has(element)) {
        var instance = weakMap.get(element);
        instances.push(instance);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return instances;
}

/**
 * Trigger Custom Event.
 *
 * @param {Element|Document} target     - HTML Element.
 * @param {string}  eventType   - Callback Function Handler
 * @param {Object}  eventDetails - Pass Event details to use on event listener function..
 * @return {boolean} - Dispatched event return.
 */
function triggerEvent(target, eventType) {
  var eventDetails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return target.dispatchEvent(new CustomEvent(eventType, {
    detail: _objectSpread({}, eventDetails)
  }));
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
    target.removeEventListener('touchstart', start);
    target.removeEventListener('touchmove', move);
    target.removeEventListener('touchend', end);
    target.removeEventListener('touchcancel', end);
    if (!settings.touchOnly) {
      target.removeEventListener('pointerdown', start);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointerleave', end);
    }
    target.removeEventListener('swipe', listenerFn);
  };
  var register = function register() {
    target.addEventListener('touchstart', start, {
      passive: true
    });
    target.addEventListener('touchmove', move, {
      passive: true
    });
    target.addEventListener('touchend', end, {
      passive: true
    });
    target.addEventListener('touchcancel', end);
    if (!settings.touchOnly) {
      target.addEventListener('pointerdown', start);
      target.addEventListener('pointermove', move);
      target.addEventListener('pointerup', end);
      target.addEventListener('pointerleave', end);
    }
    target.addEventListener('swipe', listenerFn);
    return unregister;
  };
  return register();
}