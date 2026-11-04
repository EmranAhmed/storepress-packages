/**
 * Tests for toSnakeCase
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { toSnakeCase } from '../../src/string/to-snake-case.js';

describe('toSnakeCase', () => {
  it('collapses repeated separators', () => {
    expect(toSnakeCase('foo--bar')).toBe('foo_bar')
    expect(toSnakeCase('foo__bar')).toBe('foo_bar')
    expect(toSnakeCase('foo - bar')).toBe('foo_bar')
  })

  it('converts camelCase to snake_case', () => {
    expect(toSnakeCase('firstName')).toBe('first_name')
    expect(toSnakeCase('getUserById')).toBe('get_user_by_id')
  })

  it('converts PascalCase to snake_case', () => {
    expect(toSnakeCase('HTTPSConnection')).toBe('https_connection')
    expect(toSnakeCase('UserProfile')).toBe('user_profile')
    expect(toSnakeCase('DatabaseConnection')).toBe(
      'database_connection',
    )
  })

  it('converts kebab-case to snake_case', () => {
    expect(toSnakeCase('user-name')).toBe('user_name')
    expect(toSnakeCase('api-key-secret')).toBe('api_key_secret')
  })

  it('converts space separated to snake_case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world')
    expect(toSnakeCase('My Custom Function')).toBe(
      'my_custom_function',
    )
  })

  it('handles edge cases', () => {
    expect(toSnakeCase('already_snake_case')).toBe(
      'already_snake_case',
    )
    expect(toSnakeCase('__leading_trailing__')).toBe(
      'leading_trailing',
    )
  })
})
