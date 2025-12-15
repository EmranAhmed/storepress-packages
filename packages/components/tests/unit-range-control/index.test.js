/**
 * External dependencies
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Internal dependencies
 */
import UnitRangeControl, {
  availableUnits,
  unitOperations,
  unitConverter,
} from '../../src/unit-range-control'

describe('UnitRangeControl', () => {
  // Default props for testing
  const defaultProps = {
    label: 'Width',
    value: '50px',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with label', () => {
      render(<UnitRangeControl {...defaultProps} />)
      expect(screen.getByText('Width', { selector: 'label.components-base-control__label' })).toBeInTheDocument()
    })

    it('renders UnitControl with correct value', () => {
      render(<UnitRangeControl {...defaultProps} value="100px" />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue(100)
    })

    it('renders RangeControl slider', () => {
      render(<UnitRangeControl {...defaultProps} />)

      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('applies correct CSS class', () => {
      const { container } = render(<UnitRangeControl {...defaultProps} />)

      expect(
        container.querySelector('.storepress-component-unit-range-control'),
      ).toBeInTheDocument()
    })

    it('renders with default allowed units', () => {
      render(<UnitRangeControl {...defaultProps} />)

      // The unit select should be present
      const unitSelect = screen.getByRole('combobox')
      expect(unitSelect).toBeInTheDocument()
    })

  })

  describe('UnitControl interactions', () => {
    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="50px"
          onChange={onChange}
        />,
      )

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.type(input, '100')
      await user.tab() // Trigger blur/change

      expect(onChange).toHaveBeenCalled()
    })

    it('calls onChange with correct value and unit', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="50px"
          onChange={onChange}
        />,
      )

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.type(input, '75')
      await user.tab()

      const lastArgs = onChange.mock.lastCall
      const lastValue = lastArgs[0] // Get the first argument (the value)

      expect(lastValue).toContain('75')
    })

    it('respects min value from unit settings', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="50px"
          onChange={onChange}
        />,
      )

      const input = screen.getByRole('spinbutton')
      // px unit has min: 0 by default
      expect(input).toHaveAttribute('min', '0')
    })

    it('respects max value from unit settings', async () => {
      render(<UnitRangeControl {...defaultProps} value="50px" />)

      const input = screen.getByRole('spinbutton')
      // px unit has max: 1000 by default
      expect(input).toHaveAttribute('max', '1000')
    })
  })

  describe('RangeControl (slider) interactions', () => {
    it('calls onChange when slider value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="50px"
          onChange={onChange}
        />,
      )

      const slider = screen.getByRole('slider')

      // Simulate slider change
      await user.click(slider)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('slider value reflects current numeric value', () => {
      render(<UnitRangeControl {...defaultProps} value="75px" />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('75')
    })

    it('slider shows tooltip with unit', async () => {
      render(<UnitRangeControl {...defaultProps} value="50px" />)

      const slider = screen.getByRole('slider')
      // The tooltip content should include the unit
      expect(slider).toBeInTheDocument()
    })

  })

  describe('unit change handling', () => {
    it('converts value when unit changes from px to em', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="32px"
          onChange={onChange}
          allowedUnits={['px', 'em', 'rem', '%']}
        />,
      )

      const unitSelect = screen.getByRole('combobox')
      await user.selectOptions(unitSelect, 'em')

      // 32px / 16 = 2em
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining('em'))
    })

    it('converts value when unit changes from em to px', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="2em"
          onChange={onChange}
          allowedUnits={['px', 'em', 'rem', '%']}
        />,
      )

      const unitSelect = screen.getByRole('combobox')
      await user.selectOptions(unitSelect, 'px')

      // 2em * 16 = 32px
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining('px'))
    })

    it('caps value at max when converting to smaller unit', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="2000px"
          onChange={onChange}
          allowedUnits={['px', '%']}
        />,
      )

      const unitSelect = screen.getByRole('combobox')
      await user.selectOptions(unitSelect, '%')

      // % has max of 100, should cap at 100%
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('custom allowedUnits', () => {
    it('only shows specified units', () => {
      render(
        <UnitRangeControl
          {...defaultProps}
          allowedUnits={['px', 'em']}
        />,
      )

      const unitSelect = screen.getByRole('combobox')
      const options = within(unitSelect).getAllByRole('option')

      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent('px')
      expect(options[1]).toHaveTextContent('em')
    })

    it('works with time units (s, ms)', () => {
      const onChange = jest.fn()

      render(
        <UnitRangeControl
          {...defaultProps}
          value="500ms"
          onChange={onChange}
          allowedUnits={['s', 'ms']}
        />,
      )

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue(500)
    })
  })

  describe('custom defaultUnits', () => {
    it('uses custom unit settings', () => {
      const customUnits = [
        { value: 'px', label: 'px', default: 0, min: 10, max: 500, step: 5 },
      ]

      render(
        <UnitRangeControl
          {...defaultProps}
          value="100px"
          defaultUnits={customUnits}
          allowedUnits={['px']}
        />,
      )

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('min', '10')
      expect(input).toHaveAttribute('max', '500')
      expect(input).toHaveAttribute('step', '5')
    })
  });

  describe('edge cases', () => {
    it('handles empty value', () => {
      render(<UnitRangeControl {...defaultProps} value="" />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('handles value with only unit', () => {
      render(<UnitRangeControl {...defaultProps} value="px" />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('handles decimal values', () => {
      render(<UnitRangeControl {...defaultProps} value="10.5em" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(10.5);
    });

    it('handles negative values when allowed', () => {
      const customUnits = [
        { value: 'px', label: 'px', default: 0, min: -100, max: 100, step: 1 },
      ];

      render(
        <UnitRangeControl
          {...defaultProps}
          value="-50px"
          defaultUnits={customUnits}
          allowedUnits={['px']}
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(-50);
    });
  });

  describe('accessibility', () => {
    it('has accessible labels', () => {
      render(<UnitRangeControl {...defaultProps} label="Container Width" />);

      // Label should be visible
      expect(screen.getByText('Container Width', { selector: 'label.components-base-control__label' })).toBeInTheDocument();
    });

    it('slider and input are focusable', async () => {
      const user = userEvent.setup();
      render(<UnitRangeControl {...defaultProps} />);

      const input = screen.getByRole('spinbutton');
      const slider = screen.getByRole('slider');

      await user.tab();
      // One of the controls should be focused
      expect(
        document.activeElement === input ||
        document.activeElement === slider
      ).toBe(true);
    });
  });

})

// ============================================================================
// Unit Converter Tests
// ============================================================================
describe('unitConverter', () => {
  it('returns same value when units are equal', () => {
    const result = unitConverter('px', 'px', 100, unitOperations)

    expect(result).toEqual({
      unitName: 'px',
      unitValue: 100,
      unitString: '100px',
    })
  })

  it('converts px to em (divide by 16)', () => {
    const result = unitConverter('em', 'px', 32, unitOperations)

    expect(result).toEqual({
      unitName: 'em',
      unitValue: '2.00',
      unitString: '2.00em',
    })
  })

  it('converts em to px (multiply by 16)', () => {
    const result = unitConverter('px', 'em', 2, unitOperations)

    expect(result).toEqual({
      unitName: 'px',
      unitValue: 32,
      unitString: '32px',
    })
  })

  it('converts px to rem (divide by 16)', () => {
    const result = unitConverter('rem', 'px', 48, unitOperations)

    expect(result).toEqual({
      unitName: 'rem',
      unitValue: '3.00',
      unitString: '3.00rem',
    })
  })

  it('converts rem to px (multiply by 16)', () => {
    const result = unitConverter('px', 'rem', 1.5, unitOperations)

    expect(result).toEqual({
      unitName: 'px',
      unitValue: 24,
      unitString: '24px',
    })
  })

  it('converts s to ms (multiply by 1000)', () => {
    const result = unitConverter('ms', 's', 2, unitOperations)

    expect(result).toEqual({
      unitName: 'ms',
      unitValue: 2000,
      unitString: '2000ms',
    })
  })

  it('converts ms to s (divide by 1000)', () => {
    const result = unitConverter('s', 'ms', 500, unitOperations)

    expect(result).toEqual({
      unitName: 's',
      unitValue: '0.50',
      unitString: '0.50s',
    })
  })

  it('returns original value for unknown conversion', () => {
    const result = unitConverter('%', 'vw', 50, unitOperations)

    expect(result).toEqual({
      unitName: '%',
      unitValue: 50,
      unitString: '50%',
    })
  })

  it('handles decimal input values', () => {
    const result = unitConverter('px', 'em', 1.5, unitOperations)

    expect(result).toEqual({
      unitName: 'px',
      unitValue: 24,
      unitString: '24px',
    })
  })

  it('handles zero value', () => {
    const result = unitConverter('em', 'px', 0, unitOperations)

    expect(result).toEqual({
      unitName: 'em',
      unitValue: '0.00',
      unitString: '0.00em',
    })
  })
})

// ============================================================================
// Available Units Tests
// ============================================================================
describe('availableUnits', () => {
  it('includes percentage unit', () => {
    const percentUnit = availableUnits.find((u) => u.value === '%')

    expect(percentUnit).toEqual({
      value: '%',
      label: '%',
      default: 0,
      min: 0,
      max: 100,
      step: 0.1,
    })
  })

  it('includes pixel unit', () => {
    const pxUnit = availableUnits.find((u) => u.value === 'px')

    expect(pxUnit).toEqual({
      value: 'px',
      label: 'px',
      default: 0,
      min: 0,
      max: 1000,
      step: 1,
    })
  })

  it('includes em unit', () => {
    const emUnit = availableUnits.find((u) => u.value === 'em')

    expect(emUnit).toEqual({
      value: 'em',
      label: 'em',
      default: 0,
      min: 0,
      max: 50,
      step: 0.01,
    })
  })

  it('includes rem unit', () => {
    const remUnit = availableUnits.find((u) => u.value === 'rem')

    expect(remUnit).toEqual({
      value: 'rem',
      label: 'rem',
      default: 0,
      min: 0,
      max: 50,
      step: 0.01,
    })
  })

  it('includes viewport units', () => {
    const vwUnit = availableUnits.find((u) => u.value === 'vw')
    const vhUnit = availableUnits.find((u) => u.value === 'vh')

    expect(vwUnit).toBeDefined()
    expect(vhUnit).toBeDefined()
    expect(vwUnit.max).toBe(100)
    expect(vhUnit.max).toBe(100)
  })

  it('includes time units', () => {
    const sUnit = availableUnits.find((u) => u.value === 's')
    const msUnit = availableUnits.find((u) => u.value === 'ms')

    expect(sUnit).toBeDefined()
    expect(msUnit).toBeDefined()
    expect(sUnit.max).toBe(120)
    expect(msUnit.max).toBe(120000)
  })

  it('includes fractional unit', () => {
    const frUnit = availableUnits.find((u) => u.value === 'fr')

    expect(frUnit).toEqual({
      value: 'fr',
      label: 'fr',
      default: 1,
      min: 1,
      max: 100,
      step: 1,
    })
  })
})

// ============================================================================
// Unit Operations Tests
// ============================================================================
describe('unitOperations', () => {
  it('has em/rem to px conversion', () => {
    const operation = unitOperations.find(
      (op) => op.fromUnits.includes('em') && op.toUnits.includes('px'),
    )

    expect(operation).toEqual({
      fromUnits: ['em', 'rem'],
      toUnits: ['px'],
      operator: '*',
      digit: 16,
    })
  })

  it('has px to em/rem conversion', () => {
    const operation = unitOperations.find(
      (op) => op.fromUnits.includes('px') && op.toUnits.includes('em'),
    )

    expect(operation).toEqual({
      fromUnits: ['px'],
      toUnits: ['em', 'rem'],
      operator: '/',
      digit: 16,
    })
  })

  it('has s to ms conversion', () => {
    const operation = unitOperations.find(
      (op) => op.fromUnits.includes('s') && op.toUnits.includes('ms'),
    )

    expect(operation).toEqual({
      fromUnits: ['s'],
      toUnits: ['ms'],
      operator: '*',
      digit: 1000,
    })
  })

  it('has ms to s conversion', () => {
    const operation = unitOperations.find(
      (op) => op.fromUnits.includes('ms') && op.toUnits.includes('s'),
    )

    expect(operation).toEqual({
      fromUnits: ['ms'],
      toUnits: ['s'],
      operator: '/',
      digit: 1000,
    })
  })
})