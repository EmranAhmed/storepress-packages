"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.availableUnits = void 0;
exports.unitConverter = unitConverter;
exports.unitOperations = void 0;
var _element = require("@wordpress/element");
var _components = require("@wordpress/components");
var _propTypes = _interopRequireDefault(require("prop-types"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; } /**
 * WordPress dependencies
 */
// @see: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/unit-control/utils.ts
// @see: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/height-control/index.js

/**
 * @typedef {Object} availableUnit - Type 'availableUnit'
 * @property {string} value   - Unit Key.
 * @property {string} label   - Unit Label.
 * @property {number} default - Unit Default Value
 * @property {number} min     - Unit Minimum Value
 * @property {number} max     - Unit Maximum Value
 * @property {number} step    - Unit Step
 */

/** @type {availableUnit[]} */
var availableUnits = exports.availableUnits = [{
  value: '%',
  label: '%',
  "default": 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 'px',
  label: 'px',
  "default": 0,
  min: 0,
  max: 1000,
  step: 1
}, {
  value: 'em',
  label: 'em',
  "default": 0,
  min: 0,
  max: 50,
  step: 0.01
}, {
  value: 'rem',
  label: 'rem',
  "default": 0,
  min: 0,
  max: 50,
  step: 0.01
}, {
  value: 'vw',
  label: 'vw',
  "default": 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 'vh',
  label: 'vh',
  "default": 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 's',
  label: 's',
  "default": 0,
  min: 0,
  max: 120,
  step: 0.1
}, {
  value: 'ms',
  label: 'ms',
  "default": 0,
  min: 0,
  max: 120000,
  step: 100
}, {
  value: 'fr',
  label: 'fr',
  "default": 1,
  min: 1,
  max: 100,
  step: 1
}];

/**
 * @typedef {Object} unitOperation - Type 'unitOperation'
 * @property {string[]} fromUnits - Convert from unit array.
 * @property {string[]} toUnits   - Convert to unit array
 * @property {string}   operator  - Conversion operator
 * @property {number}   digit     - Conversion digit
 */

/** @type {unitOperation[]} */
var unitOperations = exports.unitOperations = [{
  fromUnits: ['em', 'rem'],
  toUnits: ['px'],
  operator: '*',
  digit: 16
}, {
  fromUnits: ['px'],
  toUnits: ['em', 'rem'],
  operator: '/',
  digit: 16
}, {
  fromUnits: ['s'],
  toUnits: ['ms'],
  operator: '*',
  digit: 1000
}, {
  fromUnits: ['ms'],
  toUnits: ['s'],
  operator: '/',
  digit: 1000
}];
function unitConverter(newUnit, oldUnit, currentValue, operationLogics) {
  if (newUnit === oldUnit) {
    return {
      unitName: newUnit,
      unitValue: currentValue,
      unitString: "".concat(currentValue).concat(newUnit)
    };
  }
  var _iterator = _createForOfIteratorHelper(operationLogics),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var operation = _step.value;
      var fromUnits = operation.fromUnits,
        toUnits = operation.toUnits,
        operator = operation.operator,
        digit = operation.digit;
      if (toUnits.includes(newUnit) && fromUnits.includes(oldUnit)) {
        if (operator === '/') {
          var newValue = (currentValue / digit).toFixed(2);
          return {
            unitName: newUnit,
            unitValue: newValue,
            unitString: "".concat(newValue).concat(newUnit)
          };
        }
        if (operator === '*') {
          var _newValue = Math.round(currentValue * digit);
          return {
            unitName: newUnit,
            unitValue: _newValue,
            unitString: "".concat(_newValue).concat(newUnit)
          };
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return {
    unitName: newUnit,
    unitValue: currentValue,
    unitString: "".concat(currentValue).concat(newUnit)
  };
}

/**
 * @callback onChange
 * @param {string} value
 * @return {void}
 */

/**
 * UnitRangeControl renders a linked unit control and range control.
 *
 *
 * @param {Object}          props
 * @param {string}          props.label                                              - A label for the control.
 * @param {onChange}        props.onChange                                           - Called when the value changes.
 * @param {string}          props.value                                              - The current value with unit.
 * @param {string[]}        [props.allowedUnits=['%', 'px', 'em', 'rem']] - Available values.
 * @param {availableUnit[]} [props.defaultUnits]                                     - Default units.
 * @param {unitOperation[]} [props.convertUnits]                                     - Unit value conversion logic.
 *
 */
function UnitRangeControl(_ref) {
  var _units$, _unitSettings$selecte, _unitSettings$selecte2, _unitSettings$selecte3, _unitSettings$selecte4, _unitSettings$selecte5, _unitSettings$selecte6, _unitSettings$selecte7, _unitSettings$selecte8, _unitSettings$selecte9, _unitSettings$selecte0, _unitSettings$selecte1, _unitSettings$selecte10;
  var label = _ref.label,
    onChange = _ref.onChange,
    value = _ref.value,
    _ref$allowedUnits = _ref.allowedUnits,
    allowedUnits = _ref$allowedUnits === void 0 ? ['%', 'px', 'em', 'rem'] : _ref$allowedUnits,
    _ref$defaultUnits = _ref.defaultUnits,
    defaultUnits = _ref$defaultUnits === void 0 ? availableUnits : _ref$defaultUnits,
    _ref$convertUnits = _ref.convertUnits,
    convertUnits = _ref$convertUnits === void 0 ? unitOperations : _ref$convertUnits;
  var customRangeValue = parseFloat(value);
  var defaultValues = (0, _element.useMemo)(function () {
    return defaultUnits.reduce(function (accumulator, unit) {
      accumulator[unit.label] = unit["default"];
      return accumulator;
    }, {});
  }, [defaultUnits]);
  var unitSettings = (0, _element.useMemo)(function () {
    return defaultUnits.reduce(function (accumulator, unit) {
      accumulator[unit.label] = unit;
      return accumulator;
    }, {});
  }, [defaultUnits]);
  var units = (0, _components.__experimentalUseCustomUnits)({
    units: defaultUnits,
    availableUnits: allowedUnits,
    defaultValues: defaultValues
  });
  var selectedUnit = (0, _element.useMemo)(function () {
    return (0, _components.__experimentalParseQuantityAndUnitFromRawValue)(value, defaultUnits);
  }, [value, defaultUnits])[1] || ((_units$ = units[0]) === null || _units$ === void 0 ? void 0 : _units$.value) || 'px';
  var handleSliderChange = function handleSliderChange(next) {
    onChange([next, selectedUnit].join(''));
  };
  var handleUnitChange = function handleUnitChange(newUnit) {
    var _unitSettings$newUnit;
    // Attempt to smooth over differences between currentUnit and newUnit.
    // This should slightly improve the experience of switching between unit types.
    var _parseQuantityAndUnit = (0, _components.__experimentalParseQuantityAndUnitFromRawValue)(value, defaultUnits),
      _parseQuantityAndUnit2 = _slicedToArray(_parseQuantityAndUnit, 2),
      currentValue = _parseQuantityAndUnit2[0],
      currentUnit = _parseQuantityAndUnit2[1];
    var _unitConverter = unitConverter(newUnit, currentUnit, currentValue, convertUnits),
      unitValue = _unitConverter.unitValue,
      unitString = _unitConverter.unitString;
    if (unitValue > ((_unitSettings$newUnit = unitSettings[newUnit]) === null || _unitSettings$newUnit === void 0 ? void 0 : _unitSettings$newUnit.max)) {
      var _unitSettings$newUnit2;
      onChange(((_unitSettings$newUnit2 = unitSettings[newUnit]) === null || _unitSettings$newUnit2 === void 0 ? void 0 : _unitSettings$newUnit2.max) + newUnit);
    } else {
      onChange(unitString);
    }
  };
  return /*#__PURE__*/React.createElement(_components.BaseControl, {
    label: label,
    className: "storepress-component-unit-range-control"
  }, /*#__PURE__*/React.createElement(_components.Flex, null, /*#__PURE__*/React.createElement(_components.FlexItem, {
    isBlock: true
  }, /*#__PURE__*/React.createElement(_components.__experimentalUnitControl, {
    value: value,
    units: units,
    onChange: onChange,
    onUnitChange: handleUnitChange,
    min: (_unitSettings$selecte = (_unitSettings$selecte2 = unitSettings[selectedUnit]) === null || _unitSettings$selecte2 === void 0 ? void 0 : _unitSettings$selecte2.min) !== null && _unitSettings$selecte !== void 0 ? _unitSettings$selecte : 0,
    max: (_unitSettings$selecte3 = (_unitSettings$selecte4 = unitSettings[selectedUnit]) === null || _unitSettings$selecte4 === void 0 ? void 0 : _unitSettings$selecte4.max) !== null && _unitSettings$selecte3 !== void 0 ? _unitSettings$selecte3 : 100,
    step: (_unitSettings$selecte5 = (_unitSettings$selecte6 = unitSettings[selectedUnit]) === null || _unitSettings$selecte6 === void 0 ? void 0 : _unitSettings$selecte6.step) !== null && _unitSettings$selecte5 !== void 0 ? _unitSettings$selecte5 : 0.1,
    size: "__unstable-large",
    label: label,
    hideLabelFromVision: true
  })), /*#__PURE__*/React.createElement(_components.FlexItem, {
    isBlock: true
  }, /*#__PURE__*/React.createElement(_components.__experimentalSpacer, {
    marginX: 2,
    marginBottom: 0
  }, /*#__PURE__*/React.createElement(_components.RangeControl, {
    __next40pxDefaultSize: true,
    value: customRangeValue,
    min: (_unitSettings$selecte7 = (_unitSettings$selecte8 = unitSettings[selectedUnit]) === null || _unitSettings$selecte8 === void 0 ? void 0 : _unitSettings$selecte8.min) !== null && _unitSettings$selecte7 !== void 0 ? _unitSettings$selecte7 : 0,
    max: (_unitSettings$selecte9 = (_unitSettings$selecte0 = unitSettings[selectedUnit]) === null || _unitSettings$selecte0 === void 0 ? void 0 : _unitSettings$selecte0.max) !== null && _unitSettings$selecte9 !== void 0 ? _unitSettings$selecte9 : 100,
    step: (_unitSettings$selecte1 = (_unitSettings$selecte10 = unitSettings[selectedUnit]) === null || _unitSettings$selecte10 === void 0 ? void 0 : _unitSettings$selecte10.step) !== null && _unitSettings$selecte1 !== void 0 ? _unitSettings$selecte1 : 0.1,
    withInputField: false,
    onChange: handleSliderChange,
    label: label,
    hideLabelFromVision: true,
    __nextHasNoMarginBottom: true,
    renderTooltipContent: function renderTooltipContent(contentValue) {
      return "".concat(contentValue).concat(selectedUnit);
    }
  })))));
}
UnitRangeControl.propTypes = {
  label: _propTypes["default"].string.isRequired,
  value: _propTypes["default"].string.isRequired,
  onChange: _propTypes["default"].func.isRequired,
  allowedUnits: _propTypes["default"].array,
  defaultUnits: _propTypes["default"].array,
  convertUnits: _propTypes["default"].array
};
var _default = exports["default"] = UnitRangeControl;