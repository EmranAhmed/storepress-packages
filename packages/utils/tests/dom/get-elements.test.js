/**
 * Tests for getElements
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getElements } from '../../src/dom/get-elements.js';

describe('getElements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
				<div class="item" data-index="0">1</div>
				<div class="item" data-index="1">2</div>
				<div class="item" data-index="2">3</div>
				<span id="single">Single</span>
			`
  })

  it('returns matching elements for CSS selector', () => {
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

  it('returns a new array copy for arrays of elements', () => {
    const arr = Array.from(document.querySelectorAll('.item'))
    const result = getElements(arr)
    expect(result).toEqual(arr)
    expect(result).not.toBe(arr)
  })

  it('handles empty NodeList for non-matching selector', () => {
    const elements = getElements('.non-existent')
    expect(elements.length).toBe(0)
  })

  it('converts NodeList to a static array', () => {
    const nodeList = document.querySelectorAll('.item')
    const result = getElements(nodeList)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(Array.from(nodeList))
  })

  it('returns an array for CSS selector', () => {
    expect(Array.isArray(getElements('.item'))).toBe(true)
  })

  it('snapshots live HTMLCollection', () => {
    const live = document.getElementsByClassName('item')
    const result = getElements(live)
    document.body.insertAdjacentHTML('beforeend', '<div class="item">4</div>')
    expect(live.length).toBe(4)
    expect(result.length).toBe(3)
  })

  it('returns empty array for null, blank and invalid selectors', () => {
    expect(getElements(null)).toEqual([])
    expect(getElements('')).toEqual([])
    expect(getElements('   ')).toEqual([])
    expect(getElements('div[')).toEqual([])
  })

  it('returns empty array for unsupported input', () => {
    expect(getElements(123)).toEqual([])
    expect(getElements({})).toEqual([])
  })

  it('wraps elements that have their own length property', () => {
    document.body.innerHTML = '<form id="f"></form><select id="s"></select>'
    const form = document.getElementById('f')
    const select = document.getElementById('s')
    expect(getElements(form)).toEqual([form])
    expect(getElements(select)).toEqual([select])
  })

  it('wraps SVG elements', () => {
    document.body.innerHTML = '<svg id="icon"></svg>'
    const svg = document.getElementById('icon')
    expect(getElements(svg)).toEqual([svg])
  })

  it('returns array with window, not its frames', () => {
    document.body.innerHTML = '<iframe></iframe>'
    expect(getElements(window)).toEqual([window])
  })

  it('removes null and undefined entries from lists', () => {
    const single = document.getElementById('single')
    expect(getElements([single, null, undefined])).toEqual([single])
  })

  it('handles complex selectors', () => {
    const elements = getElements('div.item')
    expect(elements.length).toBe(3)
  })
})
