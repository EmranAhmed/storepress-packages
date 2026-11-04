/**
 * Tests for isPlainObject
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { isPlainObject } from '../../src/object/is-plain-object.js';

describe('isPlainObject', () => {
  it('accepts object literals and new Object()', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1, b: { c: 2 } })).toBe(true)
    expect(isPlainObject(new Object())).toBe(true)
  })

  it('accepts objects from JSON.parse', () => {
    expect(isPlainObject(JSON.parse('{"a":1}'))).toBe(true)
  })

  it('accepts null-prototype objects', () => {
    expect(isPlainObject(Object.create(null))).toBe(true)
  })

  it('rejects primitives, null and undefined', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(0)).toBe(false)
    expect(isPlainObject('')).toBe(false)
    expect(isPlainObject('object')).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(Symbol('s'))).toBe(false)
    expect(isPlainObject(10n)).toBe(false)
  })

  it('rejects functions', () => {
    expect(isPlainObject(() => {})).toBe(false)
    expect(isPlainObject(function named() {})).toBe(false)
    expect(isPlainObject(class Foo {})).toBe(false)
  })

  it('rejects arrays and built-in objects', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([1, 2])).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(/re/)).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(new Set())).toBe(false)
    expect(isPlainObject(new WeakMap())).toBe(false)
    expect(isPlainObject(Promise.resolve())).toBe(false)
    expect(isPlainObject(new Error('x'))).toBe(false)
    expect(isPlainObject(new Number(1))).toBe(false)
    expect(isPlainObject(new String('s'))).toBe(false)
  })

  it('rejects class instances', () => {
    class Foo {}
    expect(isPlainObject(new Foo())).toBe(false)
  })

  it('rejects objects whose prototype is another object', () => {
    expect(isPlainObject(Object.create({ a: 1 }))).toBe(false)
    expect(isPlainObject(Object.create(Object.create(null)))).toBe(false)
  })

  it('rejects DOM nodes and window', () => {
    expect(isPlainObject(document.body)).toBe(false)
    expect(isPlainObject(document.createElement('div'))).toBe(false)
    expect(isPlainObject(document)).toBe(false)
    expect(isPlainObject(window)).toBe(false)
  })

  it('accepts the arguments object, since its prototype is Object.prototype', () => {
    // eslint-disable-next-line prefer-rest-params
    const args = (function () { return arguments })(1, 2)
    expect(isPlainObject(args)).toBe(true)
  })
})
