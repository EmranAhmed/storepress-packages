/**
 * External dependencies
 */

import { fn } from '@storybook/test'
// import { useState } from '@wordpress/element'
import { useState } from '@storybook/addons';

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

  args: {
    onChange: fn(),
  },

  parameters: {
    controls: { expanded: true },
  },
}

export const Basic = {

  args: {
    label: 'Height',
    hideLabelFromVision: false,
    value: '100px',
    onChange: fn(),
    allowedUnits: ['%', 'px', 'em', 'rem', 'vw', 'vh'],
  },

  render: (args) => {

    const [value, setValue] = useState(args.value)

    return (
      <UnitRangeControl
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v)
        }}
      />
    )
  },
}

export const Custom = {

  args: {
    label: 'Speed',
    value: '10s',
    onChange: fn(),
    allowedUnits: ['s', 'ms'],
  },

  render: (args) => {

    const [value, setValue] = useState(args.value)

    return (
      <UnitRangeControl
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v)
        }}
      />
    )
  },
}

