/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import {
	BaseControl,
	RangeControl,
	Flex,
	FlexItem,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalSpacer as Spacer,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUseCustomUnits as useCustomUnits,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
	useBaseControlProps,
} from '@wordpress/components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { noop } from '../common';

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
export const availableUnits = [
	{ value: '%', label: '%', default: 0, min: 0, max: 100, step: 0.1 },
	{ value: 'px', label: 'px', default: 0, min: 0, max: 1000, step: 1 },
	{ value: 'em', label: 'em', default: 0, min: 0, max: 50, step: 0.01 },
	{ value: 'rem', label: 'rem', default: 0, min: 0, max: 50, step: 0.01 },
	{ value: 'vw', label: 'vw', default: 0, min: 0, max: 100, step: 0.1 },
	{ value: 'vh', label: 'vh', default: 0, min: 0, max: 100, step: 0.1 },
	{ value: 's', label: 's', default: 0, min: 0, max: 120, step: 0.1 },
	{ value: 'ms', label: 'ms', default: 0, min: 0, max: 120000, step: 100 },
	{ value: 'fr', label: 'fr', default: 1, min: 1, max: 100, step: 1 },
];

/**
 * @typedef {Object} unitOperation - Type 'unitOperation'
 * @property {string[]} fromUnits - Convert from unit array.
 * @property {string[]} toUnits   - Convert to unit array
 * @property {string}   operator  - Conversion operator
 * @property {number}   digit     - Conversion digit
 */

/** @type {unitOperation[]} */
export const unitOperations = [
	{ fromUnits: [ 'em', 'rem' ], toUnits: [ 'px' ], operator: '*', digit: 16 },
	{ fromUnits: [ 'px' ], toUnits: [ 'em', 'rem' ], operator: '/', digit: 16 },
	{ fromUnits: [ 's' ], toUnits: [ 'ms' ], operator: '*', digit: 1000 },
	{ fromUnits: [ 'ms' ], toUnits: [ 's' ], operator: '/', digit: 1000 },
];

export function unitConverter(
	newUnit,
	oldUnit,
	currentValue,
	operationLogics
) {
	if ( newUnit === oldUnit ) {
		return {
			unitName: newUnit,
			unitValue: currentValue,
			unitString: `${ currentValue }${ newUnit }`,
		};
	}

	for ( const operation of operationLogics ) {
		const { fromUnits, toUnits, operator, digit } = operation;

		if ( toUnits.includes( newUnit ) && fromUnits.includes( oldUnit ) ) {
			if ( operator === '*' ) {
				const newValue = Math.round( currentValue * digit );
				return {
					unitName: newUnit,
					unitValue: newValue,
					unitString: `${ newValue }${ newUnit }`,
				};
			}

			if ( operator === '/' ) {
				const newValue = ( currentValue / digit ).toFixed( 2 );
				return {
					unitName: newUnit,
					unitValue: newValue,
					unitString: `${ newValue }${ newUnit }`,
				};
			}
		}
	}

	return {
		unitName: newUnit,
		unitValue: currentValue,
		unitString: `${ currentValue }${ newUnit }`,
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

function UnitRangeControl( props ) {
	const {
		label = '',
		hideLabelFromVision = false,
		className = '',
		help = '',
		value = '0px',
		onChange = noop,
		allowedUnits = [ '%', 'px', 'em', 'rem' ],
		defaultUnits = availableUnits,
		convertUnits = unitOperations,
	} = props;

	const customRangeValue = parseFloat( value );

	const defaultValues = useMemo( () => {
		return defaultUnits.reduce( ( accumulator, unit ) => {
			accumulator[ unit.label ] = unit.default;
			return accumulator;
		}, {} );
	}, [ defaultUnits ] );

	const unitSettings = useMemo( () => {
		return defaultUnits.reduce( ( accumulator, unit ) => {
			accumulator[ unit.label ] = unit;
			return accumulator;
		}, {} );
	}, [ defaultUnits ] );

	const units = useCustomUnits( {
		units: defaultUnits,
		availableUnits: allowedUnits,
		defaultValues,
	} );

	const selectedUnit =
		useMemo(
			() => parseQuantityAndUnitFromRawValue( value, defaultUnits ),
			[ value, defaultUnits ]
		)[ 1 ] ||
		units[ 0 ]?.value ||
		'px';

	const handleSliderChange = ( next ) => {
		onChange( [ next, selectedUnit ].join( '' ) );
	};

	const handleUnitChange = ( newUnit ) => {
		// Attempt to smooth over differences between currentUnit and newUnit.
		// This should slightly improve the experience of switching between unit types.
		const [ currentValue, currentUnit ] = parseQuantityAndUnitFromRawValue(
			value,
			defaultUnits
		);

		const { unitValue, unitString } = unitConverter(
			newUnit,
			currentUnit,
			currentValue,
			convertUnits
		);

		if ( unitValue > unitSettings[ newUnit ]?.max ) {
			onChange( unitSettings[ newUnit ]?.max + newUnit );
		} else {
			onChange( unitString );
		}
	};

	const id = useInstanceId(
		UnitRangeControl,
		'storepress-component-unit-range-control'
	);

	const { baseControlProps } = useBaseControlProps( {
		id,
		label,
		className,
		hideLabelFromVision,
		help,
	} );

	return (
		<BaseControl { ...baseControlProps } __nextHasNoMarginBottom>
			<div className="storepress-component-unit-range-control">
				<Flex>
					<FlexItem isBlock>
						<UnitControl
							id={ id }
							value={ value }
							units={ units }
							onChange={ onChange }
							onUnitChange={ handleUnitChange }
							min={ unitSettings[ selectedUnit ]?.min ?? 0 }
							max={ unitSettings[ selectedUnit ]?.max ?? 100 }
							step={ unitSettings[ selectedUnit ]?.step ?? 0.1 }
							size="__unstable-large"
							label=""
							help=""
							hideLabelFromVision={ true }
						/>
					</FlexItem>
					<FlexItem isBlock>
						<Spacer marginX={ 2 } marginBottom={ 0 }>
							<RangeControl
								__next40pxDefaultSize
								value={ customRangeValue }
								min={ unitSettings[ selectedUnit ]?.min ?? 0 }
								max={ unitSettings[ selectedUnit ]?.max ?? 100 }
								step={
									unitSettings[ selectedUnit ]?.step ?? 0.1
								}
								withInputField={ false }
								onChange={ handleSliderChange }
								id={ null }
								label=""
								help=""
								hideLabelFromVision={ true }
								__nextHasNoMarginBottom
								renderTooltipContent={ ( contentValue ) =>
									`${ contentValue }${ selectedUnit }`
								}
							/>
						</Spacer>
					</FlexItem>
				</Flex>
			</div>
		</BaseControl>
	);
}

UnitRangeControl.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	hideLabelFromVision: PropTypes.bool,
	help: PropTypes.string,
	className: PropTypes.string,
	onChange: PropTypes.func,
	allowedUnits: PropTypes.array,
	defaultUnits: PropTypes.array,
	convertUnits: PropTypes.array,
};

export default UnitRangeControl;
