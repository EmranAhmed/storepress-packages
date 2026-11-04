/**
 * Tests for getPluginInstanceStore
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getPluginInstanceStore } from '../../src/store/get-plugin-instance-store.js';

describe('getPluginInstanceStore', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

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
