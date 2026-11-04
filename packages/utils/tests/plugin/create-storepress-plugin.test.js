/**
 * Tests for createStorePressPlugin
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createStorePressPlugin } from '../../src/plugin/create-storepress-plugin.js';

describe('createStorePressPlugin', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

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
