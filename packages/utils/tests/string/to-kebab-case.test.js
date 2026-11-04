/**
 * Tests for toKebabCase
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { toKebabCase } from '../../src/string/to-kebab-case.js';

describe('toKebabCase', () => {
  it('collapses repeated separators', () => {
    expect(toKebabCase('foo--bar')).toBe('foo-bar')
    expect(toKebabCase('foo__bar')).toBe('foo-bar')
    expect(toKebabCase('foo - bar')).toBe('foo-bar')
  })

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('firstName')).toBe('first-name')
    expect(toKebabCase('getUserById')).toBe('get-user-by-id')
    expect(toKebabCase('iPhone13Pro')).toBe('i-phone13-pro')
    expect(toKebabCase('i phone13 pro')).toBe('i-phone13-pro')
  })

  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('UserProfile')).toBe('user-profile')
    expect(toKebabCase('XMLHttpRequest')).toBe('xml-http-request')
  })

  it('converts snake_case to kebab-case', () => {
    expect(toKebabCase('user_name')).toBe('user-name')
    expect(toKebabCase('API_KEY_SECRET')).toBe('api-key-secret')
  })

  it('converts space separated to kebab-case', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
    expect(toKebabCase('My Custom Component')).toBe(
      'my-custom-component',
    )
  })

  it('converts dot.case to kebab-case', () => {
    expect(toKebabCase('config.database.url')).toBe(
      'config-database-url',
    )
  })

  it('handles edge cases', () => {
    expect(toKebabCase('already-kebab-case')).toBe(
      'already-kebab-case',
    )
    expect(toKebabCase('--leading-trailing--')).toBe(
      'leading-trailing',
    )
    expect(toKebabCase('iPhone13Pro')).toBe('i-phone13-pro')
  })

  it('handles empty string', () => {
    expect(toKebabCase('')).toBe('')
  })
})
