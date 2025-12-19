/**
 * External dependencies
 */

import { fn } from '@storybook/test'
import { useState } from '@storybook/addons'

/**
 * Internal dependencies
 */
import { UnitRangeControl } from '@storepress/components/src'

export default {
  title: 'Components/UnitRangeControl',
  component: UnitRangeControl,

  parameters: {
    controls: { expanded: true },
  },

  argTypes: {
    // __unstableInputWidth: { control: { type: 'text' } },
    onChange: { control: false },
    defaultUnits: { control: false },
    convertUnits: { control: false },
    value: { control: false },
  },
}

export const Basic = {

  args: {
    label: 'Height',
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

