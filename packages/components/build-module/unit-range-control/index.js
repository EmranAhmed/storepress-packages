/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { BaseControl, RangeControl, Flex, FlexItem,
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
__experimentalSpacer as Spacer,
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
__experimentalUseCustomUnits as useCustomUnits,
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
__experimentalUnitControl as UnitControl,
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue } from '@wordpress/components';
import PropTypes from 'prop-types';
import SearchListControl from '../search-list-control';

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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const availableUnits = [{
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
export const unitOperations = [{
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
export function unitConverter(newUnit, oldUnit, currentValue, operationLogics) {
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
      if (operator === '/') {
        const newValue = (currentValue / digit).toFixed(2);
        return {
          unitName: newUnit,
          unitValue: newValue,
          unitString: `${newValue}${newUnit}`
        };
      }
      if (operator === '*') {
        const newValue = Math.round(currentValue * digit);
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
function UnitRangeControl({
  label,
  onChange,
  value,
  allowedUnits = ['%', 'px', 'em', 'rem'],
  defaultUnits = availableUnits,
  convertUnits = unitOperations
}) {
  var _unitSettings$selecte, _unitSettings$selecte2, _unitSettings$selecte3, _unitSettings$selecte4, _unitSettings$selecte5, _unitSettings$selecte6;
  const customRangeValue = parseFloat(value);
  const defaultValues = useMemo(() => {
    return defaultUnits.reduce((accumulator, unit) => {
      accumulator[unit.label] = unit.default;
      return accumulator;
    }, {});
  }, [defaultUnits]);
  const unitSettings = useMemo(() => {
    return defaultUnits.reduce((accumulator, unit) => {
      accumulator[unit.label] = unit;
      return accumulator;
    }, {});
  }, [defaultUnits]);
  const units = useCustomUnits({
    units: defaultUnits,
    availableUnits: allowedUnits,
    defaultValues
  });
  const selectedUnit = useMemo(() => parseQuantityAndUnitFromRawValue(value, defaultUnits), [value, defaultUnits])[1] || units[0]?.value || 'px';
  const handleSliderChange = next => {
    onChange([next, selectedUnit].join(''));
  };
  const handleUnitChange = newUnit => {
    // Attempt to smooth over differences between currentUnit and newUnit.
    // This should slightly improve the experience of switching between unit types.
    const [currentValue, currentUnit] = parseQuantityAndUnitFromRawValue(value, defaultUnits);
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
  return /*#__PURE__*/_jsx(BaseControl, {
    label: label,
    className: "storepress-component-unit-range-control",
    children: /*#__PURE__*/_jsxs(Flex, {
      children: [/*#__PURE__*/_jsx(FlexItem, {
        isBlock: true,
        children: /*#__PURE__*/_jsx(UnitControl, {
          value: value,
          units: units,
          onChange: onChange,
          onUnitChange: handleUnitChange,
          min: (_unitSettings$selecte = unitSettings[selectedUnit]?.min) !== null && _unitSettings$selecte !== void 0 ? _unitSettings$selecte : 0,
          max: (_unitSettings$selecte2 = unitSettings[selectedUnit]?.max) !== null && _unitSettings$selecte2 !== void 0 ? _unitSettings$selecte2 : 100,
          step: (_unitSettings$selecte3 = unitSettings[selectedUnit]?.step) !== null && _unitSettings$selecte3 !== void 0 ? _unitSettings$selecte3 : 0.1,
          size: "__unstable-large",
          label: label,
          hideLabelFromVision: true
        })
      }), /*#__PURE__*/_jsx(FlexItem, {
        isBlock: true,
        children: /*#__PURE__*/_jsx(Spacer, {
          marginX: 2,
          marginBottom: 0,
          children: /*#__PURE__*/_jsx(RangeControl, {
            __next40pxDefaultSize: true,
            value: customRangeValue,
            min: (_unitSettings$selecte4 = unitSettings[selectedUnit]?.min) !== null && _unitSettings$selecte4 !== void 0 ? _unitSettings$selecte4 : 0,
            max: (_unitSettings$selecte5 = unitSettings[selectedUnit]?.max) !== null && _unitSettings$selecte5 !== void 0 ? _unitSettings$selecte5 : 100,
            step: (_unitSettings$selecte6 = unitSettings[selectedUnit]?.step) !== null && _unitSettings$selecte6 !== void 0 ? _unitSettings$selecte6 : 0.1,
            withInputField: false,
            onChange: handleSliderChange,
            label: label,
            hideLabelFromVision: true,
            __nextHasNoMarginBottom: true,
            renderTooltipContent: contentValue => `${contentValue}${selectedUnit}`
          })
        })
      })]
    })
  });
}

/*UnitRangeControl.defaultProps = {
  label: 'Range Control',
  onChange: (updatedValue) => {},
  value: '10px',
  allowedUnits: ['%', 'px', 'em', 'rem'],
  defaultUnits: availableUnits,
  convertUnits: unitOperations,
}*/

UnitRangeControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  allowedUnits: PropTypes.array,
  defaultUnits: PropTypes.array,
  convertUnits: PropTypes.array
};
export default UnitRangeControl;