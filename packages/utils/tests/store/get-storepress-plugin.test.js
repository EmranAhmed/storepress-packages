/**
 * Tests for getStorePressPlugin
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getStorePressPlugin } from '../../src/store/get-storepress-plugin.js';
import { getPluginInstanceStore } from '../../src/store/get-plugin-instance-store.js';

describe('getStorePressPlugin', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

  it('returns an empty object for a new namespace', () => {
    expect(getStorePressPlugin('my-slider')).toEqual({})
  })

  it('creates the window.StorePress.$Plugins structure', () => {
    const plugin = getStorePressPlugin('my-slider')
    expect(window.StorePress.$Plugins.MySlider.Plugin).toBe(plugin)
  })

  it('converts the namespace to UpperCamelCase', () => {
    getStorePressPlugin('product_gallery')
    expect(window.StorePress.$Plugins.ProductGallery).toBeDefined()
  })

  it('returns the same object for the same namespace', () => {
    expect(getStorePressPlugin('my-slider')).toBe(getStorePressPlugin('my-slider'))
  })

  it('treats namespaces that convert to the same name as one', () => {
    expect(getStorePressPlugin('my-slider')).toBe(getStorePressPlugin('my_slider'))
  })

  it('returns different objects for different namespaces', () => {
    expect(getStorePressPlugin('plugin-a')).not.toBe(getStorePressPlugin('plugin-b'))
  })

  it('keeps properties added to the returned object', () => {
    getStorePressPlugin('my-slider').version = '1.0.0'
    expect(getStorePressPlugin('my-slider').version).toBe('1.0.0')
  })

  it('keeps existing window.StorePress data', () => {
    window.StorePress = { other: true, $Plugins: { Existing: { Plugin: { a: 1 } } } }
    getStorePressPlugin('new-plugin')
    expect(window.StorePress.other).toBe(true)
    expect(window.StorePress.$Plugins.Existing.Plugin).toEqual({ a: 1 })
    expect(getStorePressPlugin('existing')).toEqual({ a: 1 })
  })

  it('shares the namespace entry with the instance store', () => {
    const plugin = getStorePressPlugin('my-slider')
    const store = getPluginInstanceStore('my-slider')
    expect(window.StorePress.$Plugins.MySlider).toEqual({ Plugin: plugin, Instance: store })
  })
})
