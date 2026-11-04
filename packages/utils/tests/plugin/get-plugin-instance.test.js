/**
 * Tests for getPluginInstance
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getPluginInstance } from '../../src/plugin/get-plugin-instance.js';
import { createPluginInstance } from '../../src/plugin/create-plugin-instance.js';

describe('getPluginInstance', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

  it('retrieves existing plugin instance', () => {
    document.body.innerHTML = '<div id="widget"></div>'

    class TestPlugin {
      constructor (element) {
        this.element = element
        this.name = 'TestPlugin'
      }
    }

    createPluginInstance('#widget', {}, TestPlugin, 'retrieval-test')
    const retrieved = getPluginInstance('#widget', 'retrieval-test')

    expect(retrieved.length).toBe(1)
    expect(retrieved[0].name).toBe('TestPlugin')
  })

  it('returns empty array for non-existent instances', () => {
    document.body.innerHTML = '<div id="widget"></div>'

    const retrieved = getPluginInstance('#widget', 'non-existent')

    expect(retrieved).toEqual([])
  })

  describe('same object as createPluginInstance', () => {
    class TestPlugin {
      constructor (element, options) {
        this.options = options
      }
    }

    it('returns the exact instance createPluginInstance created', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      const [created] = createPluginInstance('#widget', {}, TestPlugin, 'same-object')
      const [retrieved] = getPluginInstance('#widget', 'same-object')

      // Same reference, not just equal values.
      expect(retrieved).toBe(created)
      expect(retrieved.element).toBe(document.getElementById('widget'))
    })

    it('shares changes made through either reference', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      const [created] = createPluginInstance('#widget', {}, TestPlugin, 'same-object')
      created.state = 'open'

      const [retrieved] = getPluginInstance('#widget', 'same-object')
      expect(retrieved.state).toBe('open')
    })

    it('returns the same instances for multiple elements, in DOM order', () => {
      document.body.innerHTML = `
        <div class="widget" id="one"></div>
        <div class="widget" id="two"></div>
      `

      const created = createPluginInstance('.widget', {}, TestPlugin, 'same-object')
      const retrieved = getPluginInstance('.widget', 'same-object')

      expect(retrieved).toHaveLength(2)
      expect(retrieved[0]).toBe(created[0])
      expect(retrieved[1]).toBe(created[1])
      expect(retrieved[0].element.id).toBe('one')
      expect(retrieved[1].element.id).toBe('two')
    })
  })

  describe('multiple createPluginInstance calls for one element', () => {
    it('constructs the plugin only once and returns the same instance', () => {
      document.body.innerHTML = '<div id="widget"></div>'
      const constructor = jest.fn()

      class TestPlugin {
        constructor (element, options) {
          constructor(element, options)
        }
      }

      const [first] = createPluginInstance('#widget', {}, TestPlugin, 'multi-create')
      const [second] = createPluginInstance('#widget', {}, TestPlugin, 'multi-create')
      const [third] = createPluginInstance('#widget', {}, TestPlugin, 'multi-create')

      expect(constructor).toHaveBeenCalledTimes(1)
      expect(second).toBe(first)
      expect(third).toBe(first)
      expect(getPluginInstance('#widget', 'multi-create')).toEqual([first])
    })

    it('ignores options passed to later calls', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      class TestPlugin {
        constructor (element, options) {
          this.options = options
        }
      }

      createPluginInstance('#widget', { speed: 100 }, TestPlugin, 'multi-create')
      const [instance] = createPluginInstance('#widget', { speed: 500 }, TestPlugin, 'multi-create')

      // The existing instance is returned untouched; use destroy then create to change options.
      expect(instance.options).toEqual({ speed: 100 })
    })

    it('creates a new instance after the existing one is destroyed', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      class TestPlugin {
        constructor (element, options) {
          this.options = options
        }
      }

      const [first] = createPluginInstance('#widget', { speed: 100 }, TestPlugin, 'multi-create')
      first.destroy()

      expect(getPluginInstance('#widget', 'multi-create')).toEqual([])

      const [second] = createPluginInstance('#widget', { speed: 500 }, TestPlugin, 'multi-create')

      expect(second).not.toBe(first)
      expect(second.options).toEqual({ speed: 500 })
      expect(getPluginInstance('#widget', 'multi-create')[0]).toBe(second)
    })

    it('creates only the missing instances when called with more elements', () => {
      document.body.innerHTML = `
        <div class="widget" id="one"></div>
        <div class="widget" id="two"></div>
      `
      const constructor = jest.fn()

      class TestPlugin {
        constructor (element) {
          constructor(element.id)
        }
      }

      const [one] = createPluginInstance('#one', {}, TestPlugin, 'multi-create')
      const both = createPluginInstance('.widget', {}, TestPlugin, 'multi-create')

      expect(constructor.mock.calls).toEqual([['one'], ['two']])
      expect(both[0]).toBe(one)
      expect(getPluginInstance('.widget', 'multi-create')).toEqual(both)
    })

    it('keeps separate instances per namespace on the same element', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      class TestPlugin {}

      const [slider] = createPluginInstance('#widget', {}, TestPlugin, 'slider')
      const [tooltip] = createPluginInstance('#widget', {}, TestPlugin, 'tooltip')

      expect(slider).not.toBe(tooltip)
      expect(getPluginInstance('#widget', 'slider')[0]).toBe(slider)
      expect(getPluginInstance('#widget', 'tooltip')[0]).toBe(tooltip)
    })
  })
})
