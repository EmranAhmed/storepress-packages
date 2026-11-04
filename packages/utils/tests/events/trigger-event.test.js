/**
 * Tests for triggerEvent
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { triggerEvent } from '../../src/events/trigger-event.js';

describe('triggerEvent', () => {
  let element

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>'
    element = document.getElementById('test')
  })

  it('dispatches custom event on element', () => {
    const handler = jest.fn()
    element.addEventListener('customEvent', handler)

    triggerEvent(element, 'customEvent')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('passes event details', () => {
    const handler = jest.fn()
    element.addEventListener('dataEvent', handler)

    triggerEvent(element, 'dataEvent', { foo: 'bar', count: 42 })

    expect(handler).toHaveBeenCalled()
    const event = handler.mock.calls[0][0]
    expect(event.detail).toEqual({ foo: 'bar', count: 42 })
  })

  it('respects bubbles option', () => {
    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.appendChild(child)
    document.body.appendChild(parent)

    const parentHandler = jest.fn()
    parent.addEventListener('bubbleEvent', parentHandler)

    triggerEvent(child, 'bubbleEvent', {}, { bubbles: true })

    expect(parentHandler).toHaveBeenCalled()
  })

  it('does not bubble by default', () => {
    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.appendChild(child)
    document.body.appendChild(parent)

    const parentHandler = jest.fn()
    parent.addEventListener('noBubbleEvent', parentHandler)

    triggerEvent(child, 'noBubbleEvent')

    expect(parentHandler).not.toHaveBeenCalled()
  })

  it('triggers on multiple elements (NodeList)', () => {
    document.body.innerHTML = `
				<div class="target"></div>
				<div class="target"></div>
			`
    const targets = document.querySelectorAll('.target')
    const handlers = [jest.fn(), jest.fn()]

    targets[0].addEventListener('multiEvent', handlers[0])
    targets[1].addEventListener('multiEvent', handlers[1])

    triggerEvent(targets, 'multiEvent')

    expect(handlers[0]).toHaveBeenCalled()
    expect(handlers[1]).toHaveBeenCalled()
  })

  it('triggers on array of elements', () => {
    document.body.innerHTML = `
				<div id="el1"></div>
				<div id="el2"></div>
			`
    const el1 = document.getElementById('el1')
    const el2 = document.getElementById('el2')
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    el1.addEventListener('testEvent', handler1)
    el2.addEventListener('testEvent', handler2)

    triggerEvent([el1, el2], 'testEvent', { data: 'test' })

    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('is cancelable by default', () => {
    const handler = (e) => {
      expect(e.cancelable).toBe(true)
    }
    element.addEventListener('cancelTest', handler)

    triggerEvent(element, 'cancelTest')
  })

  it('respects cancelable: false option', () => {
    const handler = (e) => {
      expect(e.cancelable).toBe(false)
    }
    element.addEventListener('nonCancelTest', handler)

    triggerEvent(
      element,
      'nonCancelTest',
      {},
      { cancelable: false },
    )
  })
})
