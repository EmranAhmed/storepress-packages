/**
 * Tests for testWaitAsync
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { testWaitAsync } from '../../src/testing/test-wait-async.js';

describe('testWaitAsync', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns a Promise', () => {
    expect(testWaitAsync(0)).toBeInstanceOf(Promise)
  })

  it('resolves with the given data', async () => {
    const data = { id: 1 }
    await expect(testWaitAsync(0, data)).resolves.toBe(data)
  })

  it('resolves with an empty object by default', async () => {
    await expect(testWaitAsync(0)).resolves.toEqual({})
  })

  it('does not resolve before the given time', async () => {
    jest.useFakeTimers()
    const done = jest.fn()
    testWaitAsync(100, 'value').then(done)

    jest.advanceTimersByTime(99)
    await Promise.resolve()
    expect(done).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    await Promise.resolve()
    expect(done).toHaveBeenCalledWith('value')
  })

  it('waits at least the given time with real timers', async () => {
    const start = Date.now()
    await testWaitAsync(30)
    // Allow 1ms of timer rounding.
    expect(Date.now() - start).toBeGreaterThanOrEqual(29)
  })

  it('does not block the thread', async () => {
    let ran = false
    const promise = testWaitAsync(10).then(() => ran)
    ran = true
    await expect(promise).resolves.toBe(true)
  })
})
