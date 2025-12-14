/**
 * Tests for DOM utility functions
 *
 * @package @storepress/utils
 */

import {
  getElement,
  getElements,
  escapeRegex,
} from '../src'

describe('@storepress/utils - DOM Utilities', () => {
  describe('getElement', () => {
    beforeEach(() => {
      document.body.innerHTML = `
				<div id="test-div" class="test-class" data-id="123">Test</div>
				<button id="test-button" class="btn primary">Click</button>
				<span class="test-class">Span</span>
			`
    })

    it('returns element by ID selector', () => {
      const element = getElement('#test-div')
      expect(element).toBeTruthy()
      expect(element.id).toBe('test-div')
    })

    it('returns first element by class selector', () => {
      const element = getElement('.test-class')
      expect(element).toBeTruthy()
      expect(element.tagName).toBe('DIV')
    })

    it('returns same element when HTMLElement is passed', () => {
      const original = document.getElementById('test-div')
      const result = getElement(original)
      expect(result).toBe(original)
    })

    it('returns null for null input', () => {
      expect(getElement(null)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(getElement()).toBeNull()
    })

    it('returns null for non-existent selector', () => {
      expect(getElement('#non-existent')).toBeNull()
      expect(getElement('.missing-class')).toBeNull()
    })

    it('returns document when document is passed', () => {
      expect(getElement(document)).toBe(document)
    })

    it('returns null for invalid input types', () => {
      expect(getElement(123)).toBeNull()
      expect(getElement({})).toBeNull()
      expect(getElement([])).toBeNull()
      expect(getElement(true)).toBeNull()
    })

    it('handles complex selectors', () => {
      const element = getElement('div.test-class')
      expect(element).toBeTruthy()
      expect(element.id).toBe('test-div')
    })

    it('handles attribute selectors', () => {
      const element = getElement('[data-id="123"]')
      expect(element).toBeTruthy()
      expect(element.id).toBe('test-div')
    })

    it('handles multiple class selectors', () => {
      const element = getElement('.btn.primary')
      expect(element).toBeTruthy()
      expect(element.id).toBe('test-button')
    })
  })

  describe('getElements', () => {
    beforeEach(() => {
      document.body.innerHTML = `
				<div class="item" data-index="0">1</div>
				<div class="item" data-index="1">2</div>
				<div class="item" data-index="2">3</div>
				<span id="single">Single</span>
			`
    })

    it('returns NodeList for CSS selector', () => {
      const elements = getElements('.item')
      expect(elements.length).toBe(3)
    })

    it('returns array with single element for HTMLElement', () => {
      const single = document.getElementById('single')
      const elements = getElements(single)
      expect(elements).toEqual([single])
      expect(elements.length).toBe(1)
    })

    it('returns empty array for empty input', () => {
      expect(getElements([])).toEqual([])
      expect(getElements()).toEqual([])
    })

    it('returns array with document when document is passed', () => {
      expect(getElements(document)).toEqual([document])
    })

    it('passes through arrays of elements', () => {
      const items = document.querySelectorAll('.item')
      const arr = Array.from(items)
      const result = getElements(arr)
      expect(result).toBe(arr)
    })

    it('handles empty NodeList for non-matching selector', () => {
      const elements = getElements('.non-existent')
      expect(elements.length).toBe(0)
    })

    it('passes through NodeList', () => {
      const nodeList = document.querySelectorAll('.item')
      const result = getElements(nodeList)
      expect(result).toBe(nodeList)
    })

    it('handles complex selectors', () => {
      const elements = getElements('div.item')
      expect(elements.length).toBe(3)
    })
  })

  describe('escapeRegex', () => {
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
      const input = 'simple text'
      expect(escapeRegex(input)).toBe(input)
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
})