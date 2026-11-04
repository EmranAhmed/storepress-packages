/**
 * Tests for createPluginInstance
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createPluginInstance } from '../../src/plugin/create-plugin-instance.js';

describe('createPluginInstance', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

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
