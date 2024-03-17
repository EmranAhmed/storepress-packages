"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPluginInstance = createPluginInstance;
exports.getElement = getElement;
exports.getElements = getElements;
exports.getOptionsFromAttribute = getOptionsFromAttribute;
exports.getPluginInstance = getPluginInstance;
exports.toCamelCase = toCamelCase;
exports.triggerEvent = triggerEvent;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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
function getOptionsFromAttribute(element, attributeName) {
  var attributeKey = toCamelCase(attributeName);
  var rawSettings = element.dataset[attributeKey]; // undefined if not found

  if (!rawSettings) {
    return {};
  }
  var settings = rawSettings.replace(/\'/g, '"');
  try {
    return JSON.parse(settings);
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
function triggerEvent(target, eventType) {
  var eventDetails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return target.dispatchEvent(new CustomEvent(eventType, {
    detail: _objectSpread({}, eventDetails)
  }));
}