/**
 * Tests for swipeEvent
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { swipeEvent } from '../../src/events/swipe-event.js';

describe('swipeEvent', () => {
  let element

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="swipe-area" style="width: 200px; height: 200px;"></div>'
    element = document.getElementById('swipe-area')
  })

  it('registers swipe listener and returns cleanup function', () => {
    const handler = jest.fn()
    const cleanup = swipeEvent(element, handler)

    expect(typeof cleanup).toBe('function')
  })

  it('cleans up event listeners when cleanup is called', () => {
    const handler = jest.fn()
    const cleanup = swipeEvent(element, handler)

    cleanup()

    // After cleanup, manually dispatched swipe event should not call handler
    const event = new CustomEvent('swipe', { detail: {} })
    element.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('triggers swipe event on pointer interaction', () => {
    const handler = jest.fn()
    swipeEvent(element, handler)

    // Simulate pointer sequence
    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      x: 100,
      y: 100,
    })
    const pointerMove = new PointerEvent('pointermove', {
      clientX: 50,
      clientY: 100,
      x: 50,
      y: 100,
    })
    const pointerUp = new PointerEvent('pointerup', {
      clientX: 50,
      clientY: 100,
      x: 50,
      y: 100,
    })

    element.dispatchEvent(pointerDown)
    element.dispatchEvent(pointerMove)
    element.dispatchEvent(pointerUp)

    expect(handler).toHaveBeenCalled()
  })

  it('accepts custom offset option', () => {
    const handler = jest.fn()
    const cleanup = swipeEvent(element, handler, { offset: 50 })

    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('accepts touchOnly option', () => {
    const handler = jest.fn()
    const cleanup = swipeEvent(element, handler, { touchOnly: true })

    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('provides swipe direction in event details', () => {
    let swipeDetails = null
    const handler = (e) => {
      swipeDetails = e.detail
    }
    swipeEvent(element, handler)

    // Simulate left swipe
    element.dispatchEvent(
      new PointerEvent('pointerdown', { x: 100, y: 100 }),
    )
    element.dispatchEvent(
      new PointerEvent('pointermove', { x: 30, y: 100 }),
    )
    element.dispatchEvent(
      new PointerEvent('pointerup', { x: 30, y: 100 }),
    )

    expect(swipeDetails).toBeDefined()
    expect(swipeDetails).toHaveProperty('x')
    expect(swipeDetails).toHaveProperty('y')
    expect(swipeDetails).toHaveProperty('left')
    expect(swipeDetails).toHaveProperty('right')
    expect(swipeDetails).toHaveProperty('top')
    expect(swipeDetails).toHaveProperty('bottom')
  })
})
