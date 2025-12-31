"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.availableUnits = void 0;
exports.unitConverter = unitConverter;
exports.unitOperations = void 0;
var _compose = require("@wordpress/compose");
var _element = require("@wordpress/element");
var _components = require("@wordpress/components");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _common = require("../common");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 * WordPress dependencies
 */ /**
 * Internal dependencies
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
const availableUnits = exports.availableUnits = [{
  value: '%',
  label: '%',
  default: 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 'px',
  label: 'px',
  default: 0,
  min: 0,
  max: 1000,
  step: 1
}, {
  value: 'em',
  label: 'em',
  default: 0,
  min: 0,
  max: 50,
  step: 0.01
}, {
  value: 'rem',
  label: 'rem',
  default: 0,
  min: 0,
  max: 50,
  step: 0.01
}, {
  value: 'vw',
  label: 'vw',
  default: 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 'vh',
  label: 'vh',
  default: 0,
  min: 0,
  max: 100,
  step: 0.1
}, {
  value: 's',
  label: 's',
  default: 0,
  min: 0,
  max: 120,
  step: 0.1
}, {
  value: 'ms',
  label: 'ms',
  default: 0,
  min: 0,
  max: 120000,
  step: 100
}, {
  value: 'fr',
  label: 'fr',
  default: 1,
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
const unitOperations = exports.unitOperations = [{
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
      unitString: `${currentValue}${newUnit}`
    };
  }
  for (const operation of operationLogics) {
    const {
      fromUnits,
      toUnits,
      operator,
      digit
    } = operation;
    if (toUnits.includes(newUnit) && fromUnits.includes(oldUnit)) {
      if (operator === '*') {
        const newValue = Math.round(currentValue * digit);
        return {
          unitName: newUnit,
          unitValue: newValue,
          unitString: `${newValue}${newUnit}`
        };
      }
      if (operator === '/') {
        const newValue = (currentValue / digit).toFixed(2);
        return {
          unitName: newUnit,
          unitValue: newValue,
          unitString: `${newValue}${newUnit}`
        };
      }
    }
  }
  return {
    unitName: newUnit,
    unitValue: currentValue,
    unitString: `${currentValue}${newUnit}`
  };
}

/**
 * @callback onChange
 * @param {string} value
 * @return {void}
 */

/**
 * A combined unit input and range slider control for managing numeric values with selectable units.
 * Provides both precise input via text field and quick adjustments via slider, with automatic
 * unit conversion when switching between unit types.
 *
 * @param {Object}          props                                         Component props.
 * @param {string}          [props.label='']                              Label text displayed above the control.
 * @param {boolean}         [props.hideLabelFromVision=false]             Whether to visually hide the label while keeping it accessible to screen readers.
 * @param {string}          [props.className='']                          Additional CSS class names to apply to the control.
 * @param {string}          [props.help='']                               Help text displayed below the control.
 * @param {string}          [props.value='0px']                           Current value including unit (e.g., '100%', '16px', '2em').
 * @param {Function}        [props.onChange]                              Callback fired when the value changes. Receives the new value as a string (e.g., '10px').
 * @param {string[]}        [props.allowedUnits=['%', 'px', 'em', 'rem']] Array of unit strings the user can select from. Defaults to ['%', 'px', 'em', 'rem'].
 * @param {availableUnit[]} [props.defaultUnits]                          Unit definitions mapping unit strings to their configuration. Defaults to availableUnits.
 * @param {unitOperation[]} [props.convertUnits]                          Unit conversion operations for transforming values between units. Defaults to unitOperations. * @return {JSX.Element} The rendered unit range control component.
 */

function UnitRangeControl(props) {
  const {
    label = '',
    hideLabelFromVision = false,
    className = '',
    help = '',
    value = '0px',
    onChange = _common.noop,
    allowedUnits = ['%', 'px', 'em', 'rem'],
    defaultUnits = availableUnits,
    convertUnits = unitOperations
  } = props;
  const customRangeValue = parseFloat(value);
  const defaultValues = (0, _element.useMemo)(() => {
    return defaultUnits.reduce((accumulator, unit) => {
      accumulator[unit.label] = unit.default;
      return accumulator;
    }, {});
  }, [defaultUnits]);
  const unitSettings = (0, _element.useMemo)(() => {
    return defaultUnits.reduce((accumulator, unit) => {
      accumulator[unit.label] = unit;
      return accumulator;
    }, {});
  }, [defaultUnits]);
  const units = (0, _components.__experimentalUseCustomUnits)({
    units: defaultUnits,
    availableUnits: allowedUnits,
    defaultValues
  });
  const selectedUnit = (0, _element.useMemo)(() => (0, _components.__experimentalParseQuantityAndUnitFromRawValue)(value, defaultUnits), [value, defaultUnits])[1] || units[0]?.value || 'px';
  const handleSliderChange = next => {
    onChange([next, selectedUnit].join(''));
  };
  const handleUnitChange = newUnit => {
    // Attempt to smooth over differences between currentUnit and newUnit.
    // This should slightly improve the experience of switching between unit types.
    const [currentValue, currentUnit] = (0, _components.__experimentalParseQuantityAndUnitFromRawValue)(value, defaultUnits);
    const {
      unitValue,
      unitString
    } = unitConverter(newUnit, currentUnit, currentValue, convertUnits);
    if (unitValue > unitSettings[newUnit]?.max) {
      onChange(unitSettings[newUnit]?.max + newUnit);
    } else {
      onChange(unitString);
    }
  };
  const id = (0, _compose.useInstanceId)(UnitRangeControl, 'storepress-component-unit-range-control');
  const {
    baseControlProps
  } = (0, _components.useBaseControlProps)({
    id,
    label,
    className,
    hideLabelFromVision,
    help
  });
  return /*#__PURE__*/React.createElement(_components.BaseControl, _extends({}, baseControlProps, {
    __nextHasNoMarginBottom: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "storepress-component-unit-range-control"
  }, /*#__PURE__*/React.createElement(_components.Flex, null, /*#__PURE__*/React.createElement(_components.FlexItem, {
    isBlock: true
  }, /*#__PURE__*/React.createElement(_components.__experimentalUnitControl, {
    id: id,
    value: value,
    units: units,
    onChange: onChange,
    onUnitChange: handleUnitChange,
    min: unitSettings[selectedUnit]?.min ?? 0,
    max: unitSettings[selectedUnit]?.max ?? 100,
    step: unitSettings[selectedUnit]?.step ?? 0.1,
    size: "__unstable-large",
    label: "",
    help: "",
    hideLabelFromVision: true
  })), /*#__PURE__*/React.createElement(_components.FlexItem, {
    isBlock: true
  }, /*#__PURE__*/React.createElement(_components.__experimentalSpacer, {
    marginX: 2,
    marginBottom: 0
  }, /*#__PURE__*/React.createElement(_components.RangeControl, {
    __next40pxDefaultSize: true,
    value: customRangeValue,
    min: unitSettings[selectedUnit]?.min ?? 0,
    max: unitSettings[selectedUnit]?.max ?? 100,
    step: unitSettings[selectedUnit]?.step ?? 0.1,
    withInputField: false,
    onChange: handleSliderChange,
    id: null,
    label: "",
    help: "",
    hideLabelFromVision: true,
    __nextHasNoMarginBottom: true,
    renderTooltipContent: contentValue => `${contentValue}${selectedUnit}`
  }))))));
}
UnitRangeControl.propTypes = {
  label: _propTypes.default.string,
  value: _propTypes.default.string,
  hideLabelFromVision: _propTypes.default.bool,
  help: _propTypes.default.string,
  className: _propTypes.default.string,
  onChange: _propTypes.default.func,
  allowedUnits: _propTypes.default.array,
  defaultUnits: _propTypes.default.array,
  convertUnits: _propTypes.default.array
};
var _default = exports.default = UnitRangeControl;