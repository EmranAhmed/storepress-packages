/**
 * Tests for toCamelCase
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { toCamelCase } from '../../src/string/to-camel-case.js';

describe('toCamelCase', () => {
  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('user-profile')).toBe('userProfile')
    expect(toCamelCase('my-custom-component')).toBe(
      'myCustomComponent',
    )
  })

  it('converts snake_case to camelCase', () => {
    expect(toCamelCase('api_endpoint')).toBe('apiEndpoint')
    expect(toCamelCase('user_name')).toBe('userName')
  })

  it('converts space separated to camelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
  })

  it('converts PascalCase to camelCase', () => {
    expect(toCamelCase('UserProfile')).toBe('userProfile')
  })

  it('handles edge cases', () => {
    expect(toCamelCase('')).toBe('')
    expect(toCamelCase('a')).toBe('a')
    expect(toCamelCase('A')).toBe('a')
    expect(toCamelCase('a-b')).toBe('aB')
  })

  it('handles mixed separators', () => {
    expect(toCamelCase('data-api_handler')).toBe('dataApiHandler')
  })

  it('lowercases all-caps words', () => {
    expect(toCamelCase('HELLO_WORLD')).toBe('helloWorld')
    expect(toCamelCase('XMLHttpRequest')).toBe('xmlHttpRequest')
  })

  it('ignores repeated, leading and trailing separators', () => {
    expect(toCamelCase('foo--bar')).toBe('fooBar')
    expect(toCamelCase('foo__bar')).toBe('fooBar')
    expect(toCamelCase('  padded value  ')).toBe('paddedValue')
    expect(toCamelCase('-leading-trailing-')).toBe('leadingTrailing')
  })

  it('keeps camelCase input and digits intact', () => {
    expect(toCamelCase('addToCart')).toBe('addToCart')
    expect(toCamelCase('item2Count')).toBe('item2Count')
    expect(toCamelCase('sku-123')).toBe('sku123')
  })
})
