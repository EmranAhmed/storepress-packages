/**
 * Tests for toUpperCamelCase
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { toUpperCamelCase } from '../../src/string/to-upper-camel-case.js';

describe('toUpperCamelCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(toUpperCamelCase('user-profile')).toBe('UserProfile')
    expect(toUpperCamelCase('my-custom-component')).toBe(
      'MyCustomComponent',
    )
  })

  it('converts snake_case to PascalCase', () => {
    expect(toUpperCamelCase('api_endpoint')).toBe('ApiEndpoint')
  })

  it('converts space separated to PascalCase', () => {
    expect(toUpperCamelCase('hello world')).toBe('HelloWorld')
  })

  it('converts dot.case to PascalCase', () => {
    expect(toUpperCamelCase('my.style')).toBe('MyStyle')
  })

  it('handles edge cases', () => {
    expect(toUpperCamelCase('')).toBe('')
    expect(toUpperCamelCase('a')).toBe('A')
    expect(toUpperCamelCase('a-b')).toBe('AB')
  })

  it('handles special StorePress case', () => {
    expect(toUpperCamelCase('storepress')).toBe('StorePress')
    expect(toUpperCamelCase('STOREPRESS')).toBe('StorePress')
  })

  it('lowercases all-caps words', () => {
    expect(toUpperCamelCase('HELLO_WORLD')).toBe('HelloWorld')
    expect(toUpperCamelCase('XMLHttpRequest')).toBe('XmlHttpRequest')
  })

  it('ignores repeated, leading and trailing separators', () => {
    expect(toUpperCamelCase('foo--bar')).toBe('FooBar')
    expect(toUpperCamelCase('  padded value  ')).toBe('PaddedValue')
    expect(toUpperCamelCase('-leading-trailing-')).toBe('LeadingTrailing')
  })
})
