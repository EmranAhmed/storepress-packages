/**
 * Tests for getElement
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getElement } from '../../src/dom/get-element.js';

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
