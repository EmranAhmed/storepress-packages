/**
 * Tests for plugin system functions
 */

import {
  getPluginInstanceStore,
  getEventStore,
  createPluginInstance,
  getPluginInstance,
  createPlugin,
  createStorePressPlugin,
} from '../src'

describe('@storepress/utils - Plugin System', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

  describe('getPluginInstanceStore', () => {
    it('creates and returns a WeakMap', () => {
      const store = getPluginInstanceStore('test-plugin')
      expect(store).toBeInstanceOf(WeakMap)
    })

    it('returns same WeakMap for same namespace', () => {
      const store1 = getPluginInstanceStore('my-plugin')
      const store2 = getPluginInstanceStore('my-plugin')
      expect(store1).toBe(store2)
    })

    it('returns different WeakMap for different namespace', () => {
      const store1 = getPluginInstanceStore('plugin-a')
      const store2 = getPluginInstanceStore('plugin-b')
      expect(store1).not.toBe(store2)
    })

    it('creates namespace structure in window.StorePress', () => {
      getPluginInstanceStore('my-component')

      expect(window.StorePress).toBeDefined()
      expect(window.StorePress.$Plugins).toBeDefined()
      expect(window.StorePress.$Plugins.MyComponent).toBeDefined()
    })
  })

  describe('getEventStore', () => {
    it('creates and returns a Map', () => {
      const store = getEventStore('test-events')
      expect(store).toBeInstanceOf(Map)
    })

    it('returns same Map for same namespace', () => {
      const store1 = getEventStore('events')
      const store2 = getEventStore('events')
      expect(store1).toStrictEqual(store2)
    })
  })

  describe('createPluginInstance', () => {
    it('creates plugin instances for elements', () => {
      document.body.innerHTML = '<div class="widget"></div>'

      class TestPlugin {
        constructor (element, options) {
          this.element = element
          this.options = options
          this.initialized = true
        }
      }

      const instances = createPluginInstance(
        '.widget',
        { debug: true },
        TestPlugin,
        'test-widget',
      )

      expect(instances.length).toBe(1)
      expect(instances[0].initialized).toBe(true)
    })

    it('returns existing instance (singleton per element)', () => {
      document.body.innerHTML = '<div id="widget"></div>'

      class TestPlugin {
        constructor (element) {
          this.element = element
          this.id = Math.random()
        }
      }

      const instances1 = createPluginInstance(
        '#widget',
        {},
        TestPlugin,
        'singleton-test',
      )
      const instances2 = createPluginInstance(
        '#widget',
        {},
        TestPlugin,
        'singleton-test',
      )

      expect(instances1[0].id).toBe(instances2[0].id)
    })

    it('creates instances for multiple elements', () => {
      document.body.innerHTML = `
				<div class="multi-widget">1</div>
				<div class="multi-widget">2</div>
			`

      class MultiPlugin {
        constructor (element) {
          this.element = element
        }
      }

      const instances = createPluginInstance(
        '.multi-widget',
        {},
        MultiPlugin,
        'multi-test',
      )

      expect(instances.length).toBe(2)
    })
  })

  describe('getPluginInstance', () => {
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
  })

  describe('createPlugin', () => {
    it('creates a plugin controller with all methods', () => {
      class TestPlugin {
        constructor (element, options) {
          this.element = element
          this.options = options
        }
      }

      const controller = createPlugin({
        selector: '.test-widget',
        options: { defaultOption: true },
        plugin: TestPlugin,
        namespace: 'test-controller',
      })

      expect(controller).toBeDefined()
      expect(typeof controller.setup).toBe('function')
      expect(typeof controller.init).toBe('function')
      expect(typeof controller.destroy).toBe('function')
      expect(typeof controller.clear).toBe('function')
      expect(typeof controller.reload).toBe('function')
      expect(typeof controller.get).toBe('function')
    })

    it('initializes plugins on elements', () => {
      document.body.innerHTML = `
				<div class="auto-widget">1</div>
				<div class="auto-widget">2</div>
			`

      class AutoPlugin {
        constructor (element) {
          this.element = element
        }
      }

      const controller = createPlugin({
        selector: '.auto-widget',
        options: {},
        plugin: AutoPlugin,
        namespace: 'auto-test',
      })

      controller.setup()
      controller.init()

      const instances = controller.get()
      expect(instances.length).toBe(2)

      controller.clear()
    })
  })

  describe('createStorePressPlugin', () => {
    it('creates and registers plugin globally', () => {
      class GlobalPlugin {
        constructor (element) {
          this.element = element
        }
      }

      const plugin = createStorePressPlugin({
        selector: '.global-widget',
        options: {},
        plugin: GlobalPlugin,
        namespace: 'global-test',
      })

      expect(window.StorePress.$Plugins.GlobalTest.Plugin).toBe(
        plugin,
      )
    })
  })
})