/**
 * Tests for testWaitSync
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { testWaitSync } from '../../src/testing/test-wait-sync.js';

describe('testWaitSync', () => {
  it('blocks for at least the given time', () => {
    const start = Date.now()
    testWaitSync(30)
    expect(Date.now() - start).toBeGreaterThanOrEqual(30)
  })

  it('returns the given data', () => {
    const data = { id: 1 }
    expect(testWaitSync(0, data)).toBe(data)
    expect(testWaitSync(0, 'text')).toBe('text')
  })

  it('returns an empty object by default', () => {
    expect(testWaitSync(0)).toEqual({})
  })

  it('returns a new default object on each call', () => {
    expect(testWaitSync(0)).not.toBe(testWaitSync(0))
  })

  it('returns right away for zero or negative time', () => {
    const spy = jest.spyOn(Date, 'now')
    testWaitSync(-5)
    testWaitSync(0)
    // One call for the start time and one loop check per call.
    expect(spy).toHaveBeenCalledTimes(4)
    spy.mockRestore()
  })

  it('returns a non-Promise value', () => {
    expect(testWaitSync(0)).not.toBeInstanceOf(Promise)
  })
})
