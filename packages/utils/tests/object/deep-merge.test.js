/**
 * Tests for deepMerge
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { deepMerge } from '../../src/object/deep-merge.js';

describe('deepMerge', () => {
  it('merges simple objects', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { b: 3, c: 4 }
    const result = deepMerge(obj1, obj2)

    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('deep merges nested objects', () => {
    const defaults = {
      theme: {
        colors: { primary: 'blue', secondary: 'gray' },
        spacing: { margin: 10, padding: 5 },
      },
    }
    const custom = {
      theme: {
        colors: { primary: 'red' },
      },
    }
    const result = deepMerge(defaults, custom)

    expect(result.theme.colors.primary).toBe('red')
    expect(result.theme.colors.secondary).toBe('gray')
    expect(result.theme.spacing.margin).toBe(10)
    expect(result.theme.spacing.padding).toBe(5)
  })

  it('replaces arrays instead of merging', () => {
    const obj1 = { tags: ['a', 'b'] }
    const obj2 = { tags: ['c', 'd'] }
    const result = deepMerge(obj1, obj2)

    expect(result.tags).toEqual(['c', 'd'])
  })

  it('handles null values', () => {
    const obj1 = { settings: { theme: 'dark' } }
    const obj2 = { settings: null }
    const result = deepMerge(obj1, obj2)

    expect(result.settings).toBeNull()
  })

  it('merges multiple sources', () => {
    const base = { a: 1 }
    const override1 = { b: 2 }
    const override2 = { c: 3 }
    const result = deepMerge(base, override1, override2)

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('handles empty objects', () => {
    expect(deepMerge({})).toEqual({})
    expect(deepMerge({ a: 1 })).toEqual({ a: 1 })
    expect(deepMerge({}, { b: 2 }, {})).toEqual({ b: 2 })
  })

  it('does not mutate original objects', () => {
    const obj1 = { a: 1, nested: { x: 10 } }
    const obj2 = { b: 2, nested: { y: 20 } }
    const result = deepMerge(obj1, obj2)

    expect(obj1.nested).not.toHaveProperty('y')
    expect(obj2.nested).not.toHaveProperty('x')
    expect(result.nested).toEqual({ x: 10, y: 20 })
  })

  it('handles deeply nested structures', () => {
    const obj1 = {
      level1: {
        level2: {
          level3: {
            value: 'original',
          },
        },
      },
    }
    const obj2 = {
      level1: {
        level2: {
          level3: {
            value: 'updated',
            newKey: 'added',
          },
        },
      },
    }

    const result = deepMerge(obj1, obj2)

    expect(result.level1.level2.level3.value).toBe('updated')
    expect(result.level1.level2.level3.newKey).toBe('added')
  })

  it('handles mixed types (object replaced by primitive)', () => {
    const obj1 = { config: { debug: true } }
    const obj2 = { config: 'simple' }
    const result = deepMerge(obj1, obj2)

    expect(result.config).toBe('simple')
  })

  it('handles mixed types (primitive replaced by object)', () => {
    const obj1 = { config: 'simple' }
    const obj2 = { config: { debug: true } }
    const result = deepMerge(obj1, obj2)

    expect(result.config).toEqual({ debug: true })
  })

  it('preserves prototype chain for plain objects', () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const result = deepMerge(obj1, obj2)

    expect(result.hasOwnProperty('a')).toBe(true)
    expect(result.hasOwnProperty('b')).toBe(true)
  })
})
