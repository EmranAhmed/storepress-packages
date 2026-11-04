/**
 * Tests for toConstantCase
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { toConstantCase } from '../../src/string/to-constant-case.js';

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
