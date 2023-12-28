"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPluginInstance = createPluginInstance;
exports.getElements = getElements;
exports.getOptionsFromAttribute = getOptionsFromAttribute;
exports.toCamelCase = toCamelCase;
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var weakMap = new WeakMap();
function getElements(selectors) {
  // querySelector
  if (typeof selectors === 'string') {
    return document.querySelectorAll(selectors);
  }

  // HTMLElement
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