/**
 * Tests for findObjectValue
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { findObjectValue } from '../../src/object/find-object-value.js';

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

  it('stops at the first falsy value on the way', () => {
    expect(findObjectValue({ count: 0 }, 'count.total', 10)).toBe(0)
    expect(findObjectValue({ sale: null }, 'sale.price', 1)).toBeNull()
    expect(findObjectValue(null, 'a.b', 'd')).toBeNull()
    expect(findObjectValue(undefined, 'a.b', 'd')).toBe('d')
  })

  it('returns undefined for a path with no keys', () => {
    expect(findObjectValue(testObj, '...', 'd')).toBeUndefined()
    expect(findObjectValue(testObj, '[]', 'd')).toBeUndefined()
    expect(findObjectValue(testObj, '-_', 'd')).toBeUndefined()
    expect(findObjectValue(testObj, [], 'd')).toBeUndefined()
    expect(findObjectValue(testObj, false, 'd')).toBeUndefined()
  })

  it('treats a number path as a single key', () => {
    expect(findObjectValue(['a', 'b'], 1)).toBe('b')
    expect(findObjectValue(['a', 'b'], 0)).toBe('a')
    expect(findObjectValue(['a', 'b'], 5, 'd')).toBe('d')
    expect(findObjectValue(['a'], NaN, 'd')).toBeUndefined()
  })

  it('ignores inherited properties', () => {
    expect(findObjectValue({}, 'constructor', false)).toBe(false)
    expect(findObjectValue({}, 'toString', 'd')).toBe('d')
    expect(findObjectValue({}, ['hasOwnProperty'], 'd')).toBe('d')
    expect(
      findObjectValue(Object.create({ inherited: 1 }), 'inherited', 'd'),
    ).toBe('d')
  })

  it('still reads length and indexes of strings and arrays', () => {
    expect(findObjectValue(testObj, 'user.name.length')).toBe(4)
    expect(findObjectValue(testObj, 'user.name.0')).toBe('J')
    expect(findObjectValue(testObj, 'items.length')).toBe(3)
  })

  it('reads values from null-prototype objects', () => {
    const obj = Object.create(null)
    obj.a = { b: 1 }
    expect(findObjectValue(obj, 'a.b')).toBe(1)
  })

  it('uses the default notation when notation is null', () => {
    expect(findObjectValue(testObj, 'user-address-city', 'd', null)).toBe(
      'NYC',
    )
  })

  it('treats the whole string as one key with an empty notation', () => {
    expect(findObjectValue({ 'x.y': 2 }, 'x.y', 'd', [])).toBe(2)
  })

  it('splits on each character of a multi-character separator', () => {
    expect(findObjectValue({ a: { b: 1 } }, 'a::b', 'd', '::')).toBe(1)
  })

  it('skips empty segments', () => {
    expect(findObjectValue(testObj, 'user..name')).toBe('John')
    expect(findObjectValue(testObj, '.user.name.')).toBe('John')
  })

  it('reads bracket indexes', () => {
    expect(findObjectValue(testObj, 'items[1]')).toBe('b')
    expect(findObjectValue(testObj, 'user.roles[0]')).toBe('admin')
  })

  it('does not split array paths', () => {
    expect(findObjectValue({ 'a.b': { c: 1 } }, ['a.b', 'c'])).toBe(1)
  })
})
