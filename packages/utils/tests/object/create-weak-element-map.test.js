/**
 * Tests for createWeakElementMap
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createWeakElementMap } from '../../src/object/create-weak-element-map.js';

describe('createWeakElementMap', () => {
  let a, b, c

  beforeEach(() => {
    a = document.createElement('div')
    b = document.createElement('span')
    c = document.createElement('p')
  })

  it('starts empty', () => {
    const map = createWeakElementMap()
    expect(map.size).toBe(0)
    expect(map.has(a)).toBe(false)
    expect(map.get(a)).toBeUndefined()
    expect([...map]).toEqual([])
  })

  it('sets, gets and checks values', () => {
    const map = createWeakElementMap()
    map.set(a, 1)
    expect(map.has(a)).toBe(true)
    expect(map.get(a)).toBe(1)
    expect(map.has(b)).toBe(false)
  })

  it('returns the map from set() so calls can be chained', () => {
    const map = createWeakElementMap()
    expect(map.set(a, 1)).toBe(map)
    map.set(b, 2).set(c, 3)
    expect(map.size).toBe(3)
  })

  it('overwrites a value without adding a second entry', () => {
    const map = createWeakElementMap()
    map.set(a, 1)
    map.set(a, 2)
    expect(map.get(a)).toBe(2)
    expect(map.size).toBe(1)
    expect([...map.keys()]).toEqual([a])
  })

  it('stores falsy values', () => {
    const map = createWeakElementMap()
    map.set(a, undefined).set(b, null).set(c, 0)
    expect(map.has(a)).toBe(true)
    expect(map.get(b)).toBeNull()
    expect(map.get(c)).toBe(0)
    expect(map.size).toBe(3)
  })

  it('accepts any object as a key, not only elements', () => {
    const map = createWeakElementMap()
    const key = {}
    map.set(key, 'value')
    expect(map.get(key)).toBe('value')
  })

  it('throws for primitive keys, like WeakMap', () => {
    const map = createWeakElementMap()
    expect(() => map.set('a', 1)).toThrow(TypeError)
    expect(map.has('a')).toBe(false)
  })

  it('deletes entries', () => {
    const map = createWeakElementMap()
    map.set(a, 1).set(b, 2)
    expect(map.delete(a)).toBe(true)
    expect(map.has(a)).toBe(false)
    expect(map.size).toBe(1)
    expect([...map.keys()]).toEqual([b])
  })

  it('returns false when deleting a missing key', () => {
    const map = createWeakElementMap()
    expect(map.delete(a)).toBe(false)
    map.set(a, 1)
    map.delete(a)
    expect(map.delete(a)).toBe(false)
  })

  it('can set a key again after deleting it', () => {
    const map = createWeakElementMap()
    map.set(a, 1)
    map.delete(a)
    map.set(a, 2)
    expect(map.get(a)).toBe(2)
    expect(map.size).toBe(1)
  })

  it('clears all entries', () => {
    const map = createWeakElementMap()
    map.set(a, 1).set(b, 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.has(a)).toBe(false)
    expect(map.get(b)).toBeUndefined()
    map.set(a, 3)
    expect(map.size).toBe(1)
  })

  it('iterates keys, values and entries in insertion order', () => {
    const map = createWeakElementMap()
    map.set(a, 1).set(b, 2).set(c, 3)
    expect([...map.keys()]).toEqual([a, b, c])
    expect([...map.values()]).toEqual([1, 2, 3])
    expect([...map.entries()]).toEqual([[a, 1], [b, 2], [c, 3]])
    expect([...map]).toEqual([[a, 1], [b, 2], [c, 3]])
  })

  it('supports for...of with destructuring', () => {
    const map = createWeakElementMap()
    map.set(a, 1).set(b, 2)
    const seen = []
    for (const [key, value] of map) {
      seen.push([key.tagName, value])
    }
    expect(seen).toEqual([['DIV', 1], ['SPAN', 2]])
  })

  it('calls forEach with value, key, map and thisArg', () => {
    const map = createWeakElementMap()
    map.set(a, 1).set(b, 2)
    const ctx = {}
    const callback = jest.fn(function () {
      expect(this).toBe(ctx)
    })
    map.forEach(callback, ctx)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 1, a, map)
    expect(callback).toHaveBeenNthCalledWith(2, 2, b, map)
  })

  it('keeps separate data per map', () => {
    const map1 = createWeakElementMap()
    const map2 = createWeakElementMap()
    map1.set(a, 1)
    expect(map2.has(a)).toBe(false)
    expect(map2.size).toBe(0)
  })

  describe('garbage-collected keys', () => {
    const RealWeakRef = global.WeakRef
    let refs

    // A fake WeakRef whose target can be "collected" on demand.
    class FakeWeakRef {
      constructor(target) {
        this.target = target
        refs.push(this)
      }

      deref() {
        return this.target
      }
    }

    const collect = (key) => {
      refs.find((ref) => ref.target === key).target = undefined
    }

    beforeEach(() => {
      refs = []
      global.WeakRef = FakeWeakRef
    })

    afterEach(() => {
      global.WeakRef = RealWeakRef
    })

    it('skips collected keys in size and iteration', () => {
      const map = createWeakElementMap()
      map.set(a, 1).set(b, 2).set(c, 3)
      collect(b)
      expect(map.size).toBe(2)
      expect([...map.keys()]).toEqual([a, c])
      expect([...map.values()]).toEqual([1, 3])
      const callback = jest.fn()
      map.forEach(callback)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('clear() still works after a key was collected', () => {
      const map = createWeakElementMap()
      map.set(a, 1).set(b, 2)
      collect(a)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has(b)).toBe(false)
    })
  })
})
