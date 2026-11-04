/**
 * Tests for createPlugin
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createPlugin } from '../../src/plugin/create-plugin.js';

describe('createPlugin', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

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
