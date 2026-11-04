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
})
