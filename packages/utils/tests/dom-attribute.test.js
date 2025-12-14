/**
 * Tests for string case conversion functions
 *
 * @package @storepress/utils
 */

import {
  getOptionsFromAttribute,
} from '../src'

describe('@storepress/utils - DOM Attribute Utilities', () => {
  describe('getOptionsFromAttribute', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('parses JSON from data attribute', () => {
      document.body.innerHTML = `
				<div id="test" data-config='{"autoplay": true, "speed": 500}'></div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'config')

      expect(options.autoplay).toBe(true)
      expect(options.speed).toBe(500)
    })

    it('parses JSON from data attribute in single quote', () => {
      document.body.innerHTML = `
				<div id="test" data-config="{'autoplay': 'true', 'speed': '500'}"></div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'config')

      expect(options.autoplay).toBe(true)
      expect(options.speed).toBe(500)
    })

    it('parses nested override attributes', () => {
      document.body.innerHTML = `
				<div id="test" 
					data-slider='{"autoplay": true}'
					data-slider--animation--duration="800"
					data-slider--animation--easing="ease-in-out"
					data-slider--animation-time="ok">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'slider')

      expect(options.autoplay).toBe(true)
      expect(options.animation.duration).toBe(800)
      expect(options.animation.easing).toBe('ease-in-out')
      expect(options.animationTime).toBe('ok')
    })

    it('converts boolean strings', () => {
      document.body.innerHTML = `
				<div id="test" 
					data-opts--enabled="true"
					data-opts--disabled="false"
					data-opts--yes="yes"
					data-opts--no="no">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'opts')

      expect(options.enabled).toBe(true)
      expect(options.disabled).toBe(false)
      expect(options.yes).toBe(true)
      expect(options.no).toBe(false)
    })

    it('converts numeric strings', () => {
      document.body.innerHTML = `
				<div id="test" 
					data-opts--count="42"
					data-opts--rate="3.14"
					data-opts--negative="-10">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'opts')

      expect(options.count).toBe(42)
      expect(options.rate).toBe(3.14)
      expect(options.negative).toBe(-10)
    })

    it('parses regex patterns', () => {
      document.body.innerHTML = `
				<div id="test" data-opts--pattern="/^test$/i"></div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'opts')

      expect(options.pattern).toBeInstanceOf(RegExp)
      expect(options.pattern.test('TEST')).toBe(true)
      expect(options.pattern.test('testing')).toBe(false)
    })

    it('handles empty base attribute with overrides', () => {
      document.body.innerHTML = `
				<div id="test" 
					data-widget--theme-color="red"
					data-widget--size="large">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'widget')

      expect(options.themeColor).toBe('red')
      expect(options.size).toBe('large')
    })

    it('respects custom parsing features - disable number parsing', () => {
      document.body.innerHTML = `
				<div id="test" data-opts--value="42"></div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'opts', {
        parseNumber: false,
      })

      expect(options.value).toBe('42')
      expect(typeof options.value).toBe('string')
    })

    it('respects custom parsing features - disable boolean parsing', () => {
      document.body.innerHTML = `
				<div id="test" data-opts--active="true"></div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'opts', {
        parseBoolean: false,
      })

      expect(options.active).toBe('true')
      expect(typeof options.active).toBe('string')
    })

    it('handles deeply nested override attributes', () => {
      document.body.innerHTML = `
				<div id="test"
					data-config--level1--level2--level3="deep">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'config')

      expect(options.level1.level2.level3).toBe('deep')
    })

    it('accepts selector string instead of element', () => {
      document.body.innerHTML = `
				<div id="test" data-opts--value="test"></div>
			`
      const options = getOptionsFromAttribute('#test', 'opts')

      expect(options.value).toBe('test')
    })

    it('merges base JSON with override attributes', () => {
      document.body.innerHTML = `
				<div id="test" 
					data-config='{"existing": true, "nested": {"a": 1}}'
					data-config--nested--b="2"
					data-config--new="added">
				</div>
			`
      const element = document.getElementById('test')
      const options = getOptionsFromAttribute(element, 'config')

      expect(options.existing).toBe(true)
      expect(options.nested.a).toBe(1)
      expect(options.nested.b).toBe(2)
      expect(options.new).toBe('added')
    })
  })
})

