/**
 * Tests for object utility functions
 *
 * @package @storepress/utils
 */
import {
  deepMerge, findObjectValue,
} from '../src'

describe('@storepress/utils - Object Utilities', () => {
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

  describe('findObjectValue', () => {
    const testObj = {
      user: {
        name: 'John',
        address: {
          city: 'NYC',
          zip: 10001,
        },
        roles: ['admin', 'editor'],
      },
      items: ['a', 'b', 'c'],
      count: 42,
      active: true,
    }

    it('finds nested value with dot notation', () => {
      expect(findObjectValue(testObj, 'user.name')).toBe('John')
      expect(findObjectValue(testObj, 'user.address.city')).toBe(
        'NYC',
      )
      expect(findObjectValue(testObj, 'user.address.zip')).toBe(
        10001,
      )
    })

    it('finds value with hyphen notation', () => {
      expect(findObjectValue(testObj, 'user-name')).toBe('John')
      expect(findObjectValue(testObj, 'user-address-city')).toBe(
        'NYC',
      )
    })

    it('finds value with underscore notation', () => {
      expect(findObjectValue(testObj, 'user_name')).toBe('John')
      expect(findObjectValue(testObj, 'user_address_city')).toBe(
        'NYC',
      )
    })

    it('returns default value for non-existent path', () => {
      expect(findObjectValue(testObj, 'user.email', 'default')).toBe(
        'default',
      )
      expect(
        findObjectValue(testObj, 'missing.path', 'fallback'),
      ).toBe('fallback')
      expect(findObjectValue(testObj, 'user.phone', null)).toBeNull()
    })

    it('handles array paths', () => {
      expect(findObjectValue(testObj, ['user', 'name'])).toBe(
        'John',
      )
      expect(
        findObjectValue(testObj, ['user', 'address', 'zip']),
      ).toBe(10001)
    })

    it('returns undefined for empty path', () => {
      expect(findObjectValue(testObj, '')).toBeUndefined()
      expect(findObjectValue(testObj, null)).toBeUndefined()
    })

    it('handles array index access', () => {
      expect(findObjectValue(testObj, ['items', 0])).toBe('a')
      expect(findObjectValue(testObj, ['items', 2])).toBe('c')
      expect(findObjectValue(testObj, ['user', 'roles', 0])).toBe(
        'admin',
      )
    })

    it('returns undefined when path reaches non-object', () => {
      expect(
        findObjectValue(testObj, 'user.name.invalid'),
      ).toBeUndefined()
      expect(findObjectValue(testObj, 'count.value')).toBeUndefined()
    })

    it('finds top-level values', () => {
      expect(findObjectValue(testObj, 'count')).toBe(42)
      expect(findObjectValue(testObj, 'active')).toBe(true)
    })

    it('handles custom notation separators', () => {
      const obj = { foo: { bar: 'baz' } }
      expect(findObjectValue(obj, 'foo:bar', undefined, [':'])).toBe(
        'baz',
      )
      expect(findObjectValue(obj, 'foo|bar', undefined, ['|'])).toBe(
        'baz',
      )
    })

    it('handles falsy values correctly', () => {
      const objWithFalsy = {
        zero: 0,
        empty: '',
        nullVal: null,
        falseVal: false,
      }

      expect(findObjectValue(objWithFalsy, 'zero')).toBe(0)
      expect(findObjectValue(objWithFalsy, 'empty')).toBe('')
      expect(findObjectValue(objWithFalsy, 'nullVal')).toBeNull()
      expect(findObjectValue(objWithFalsy, 'falseVal')).toBe(false)
    })
  })
})