/**
 * External dependencies
 */

import { fn } from '@storybook/test'

import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { UnitRangeControl } from '@storepress/components/src'

export default {
  title: 'Components/UnitRangeControl',
  component: UnitRangeControl,

  argTypes: {
    // __unstableInputWidth: { control: { type: 'text' } },
    onChange: { control: false },
    defaultUnits: { control: false },
    convertUnits: { control: false },
    value: { control: false },
  },

  parameters: {
    controls: { expanded: true },
  },
}

export const Basic = {

  args: {
    label: 'Height',
    value: '100px',
    onChange: fn(),
    allowedUnits: ['%', 'px', 'em', 'rem', 'vw', 'vh'],
  },

  render: ( args ) => {

    const [ value, setValue ] = useState( '100px' );

    return (
      <UnitRangeControl
        label={args.label}
        value={ value }
        onChange={ ( v ) => {
          setValue( v );
        } }
        allowedUnits={ args.allowedUnits }
      />
    );
  },
}

export const Custom = {

  args: {
    label: 'Speed',
    value: '10s',
    onChange: fn(),
    allowedUnits: ['s', 'ms'],
  },

  render: ( args ) => {

    const [ value, setValue ] = useState( '10s' );

    return (
      <UnitRangeControl
        label={args.label}
        value={ value }
        onChange={ ( v ) => {
          setValue( v );
        } }
        allowedUnits={ args.allowedUnits }
      />
    );
  },
}

