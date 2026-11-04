/**
 * Tests for escapeRegex
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { escapeRegex } from '../../src/string/escape-regex.js';

describe('escapeRegex', () => {
  it('throws TypeError for non-string input', () => {
    expect(() => escapeRegex(42)).toThrow(TypeError)
    expect(() => escapeRegex(null)).toThrow(TypeError)
  })

  it('produces output valid with u and v flags', () => {
    expect(new RegExp(escapeRegex('wc-cart'), 'u').test('wc-cart')).toBe(true)
    expect(new RegExp(escapeRegex('wc-cart'), 'v').test('wc-cart')).toBe(true)
  })

  describe('fallback without RegExp.escape', () => {
    const nativeEscape = RegExp.escape

    beforeEach(() => {
      RegExp.escape = undefined
    })

    afterEach(() => {
      RegExp.escape = nativeEscape
    })

    it('escapes syntax characters with a backslash', () => {
      expect(escapeRegex('$19.99')).toBe('\\$19\\.99')
      expect(escapeRegex('[(a|b)]')).toBe('\\[\\(a\\|b\\)\\]')
    })

    it('hex-escapes a leading letter or digit, punctuators and whitespace', () => {
      expect(escapeRegex('a.b')).toBe('\\x61\\.b')
      expect(escapeRegex('wc-cart')).toBe('\\x77c\\x2dcart')
      expect(escapeRegex('_ \n')).toBe('_\\x20\\n')
      expect(escapeRegex('_\u2028')).toBe('_\\u2028')
    })

    it('produces output valid with u and v flags', () => {
      expect(new RegExp(escapeRegex('wc-cart'), 'u').test('wc-cart')).toBe(true)
      expect(new RegExp(escapeRegex('wc-cart'), 'v').test('wc-cart')).toBe(true)
      expect(new RegExp(`[${escapeRegex('a&&b!!')}]`, 'v').test('&')).toBe(true)
    })

    it('does not merge a leading digit with a preceding backreference', () => {
      expect(new RegExp('(a)\\1' + escapeRegex('0')).test('aa0')).toBe(true)
    })

    it('keeps emoji together and escapes lone surrogates', () => {
      expect(escapeRegex('_👍')).toBe('_👍')
      expect(escapeRegex('_\ud800')).toBe('_\\ud800')
    })

    it('matches native RegExp.escape output', () => {
      if (typeof nativeEscape !== 'function') {
        return
      }
      const samples = [
        'What is $100 + $200?',
        'price (USD)',
        '1.234,50 €',
        '{amount} & {country}',
        'Size: XL?',
        '\t<a href="#">x</a>\r\n',
        '\u00a0\ufeff👍',
      ]
      samples.forEach((sample) => {
        expect(escapeRegex(sample)).toBe(nativeEscape.call(RegExp, sample))
      })
    })
  })

  it('escapes special regex characters', () => {
    const input = 'What is $100 + $200?'
    const escaped = escapeRegex(input)
    const regex = new RegExp(escaped)

    expect(regex.test(input)).toBe(true)
  })

  it('escapes brackets and parentheses', () => {
    const input = '[test](value)'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\[')
    expect(escaped).toContain('\\]')
    expect(escaped).toContain('\\(')
    expect(escaped).toContain('\\)')
  })

  it('escapes dots and asterisks', () => {
    const input = 'file.*.txt'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\.')
    expect(escaped).toContain('\\*')
  })

  it('handles empty string', () => {
    expect(escapeRegex('')).toBe('')
  })

  it('handles string without special characters', () => {
		const input = 'simple text';
		const regex = new RegExp( `^${ escapeRegex( input ) }$` );

		expect( regex.test( input ) ).toBe( true );
  })

  it('escapes caret and dollar sign', () => {
    const input = '^start$end'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\^')
    expect(escaped).toContain('\\$')
  })

  it('escapes plus and question mark', () => {
    const input = 'a+b?c'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\+')
    expect(escaped).toContain('\\?')
  })

  it('escapes curly braces and pipe', () => {
    const input = 'a{1,3}|b'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\{')
    expect(escaped).toContain('\\}')
    expect(escaped).toContain('\\|')
  })

  it('creates working regex patterns for search', () => {
    const searchTerm = 'C++ (programming)'
    const escaped = escapeRegex(searchTerm)
    const regex = new RegExp(escaped, 'i')

    expect(regex.test('Learn C++ (programming) basics')).toBe(
      true,
    )
    expect(regex.test('Learn Cpp programming basics')).toBe(
      false,
    )
  })

  it('handles backslashes', () => {
    const input = 'path\\to\\file'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\\\')
  })

  it('handles forward slashes', () => {
    const input = 'path/to/file'
    const escaped = escapeRegex(input)

    expect(escaped).toContain('\\/')
  })
})
