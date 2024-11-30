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
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
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
/**
 * Get Option from HTML Attribute
 *
 * @param {Element} element         - HTML Element.
 * @param {string}  attributeName   - Attribute Name
 * @return {Object}                 - Return Object.
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
          triggerEvent(element, 'destroy');
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