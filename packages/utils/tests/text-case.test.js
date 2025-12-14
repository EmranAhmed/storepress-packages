/**
 * Tests for string case conversion functions
 *
 * @package @storepress/utils
 */

import {
  toKebabCase,
  toSnakeCase,
  toConstantCase,
  toCamelCase,
  toUpperCamelCase,
} from '../src'

describe('@storepress/utils - String Case Conversions', () => {
  describe('toKebabCase', () => {
    it('converts camelCase to kebab-case', () => {
      expect(toKebabCase('firstName')).toBe('first-name')
      expect(toKebabCase('getUserById')).toBe('get-user-by-id')
      expect(toKebabCase('iPhone13Pro')).toBe('i-phone13-pro')
      expect(toKebabCase('i phone13 pro')).toBe('i-phone13-pro')
    })

    it('converts PascalCase to kebab-case', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile')
      expect(toKebabCase('XMLHttpRequest')).toBe('xmlhttp-request')
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

  describe('toSnakeCase', () => {
    it('converts camelCase to snake_case', () => {
      expect(toSnakeCase('firstName')).toBe('first_name')
      expect(toSnakeCase('getUserById')).toBe('get_user_by_id')
    })

    it('converts PascalCase to snake_case', () => {
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


  describe('toConstantCase', () => {
    it('converts camelCase to CONSTANT_CASE', () => {
      expect(toConstantCase('apiKey')).toBe('API_KEY')
      expect(toConstantCase('maxRetryAttempts')).toBe(
        'MAX_RETRY_ATTEMPTS',
      )
    })

    it('converts kebab-case to CONSTANT_CASE', () => {
      expect(toConstantCase('api-key')).toBe('API_KEY')
      expect(toConstantCase('cache-timeout')).toBe('CACHE_TIMEOUT')
    })

    it('converts snake_case to CONSTANT_CASE', () => {
      expect(toConstantCase('user_name')).toBe('USER_NAME')
      expect(toConstantCase('jwt_secret')).toBe('JWT_SECRET')
    })

    it('handles already constant case', () => {
      expect(toConstantCase('ALREADY_CONSTANT_CASE')).toBe(
        'ALREADY_CONSTANT_CASE',
      )
    })

    it('handles edge cases', () => {
      expect(toConstantCase('--leading--trailing--')).toBe(
        'LEADING_TRAILING',
      )
      expect(toConstantCase('iPhone13Pro')).toBe('I_PHONE13_PRO')
    })
  })

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
  })

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
  })
})