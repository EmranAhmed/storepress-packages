/**
 * Tests for createEventManager
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { createEventManager } from '../../src/events/create-event-manager.js';

describe('createEventManager', () => {
  let element
  let manager

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>'
    element = document.getElementById('test')
    manager = createEventManager('test-namespace')
    // Reset StorePress global namespace
    delete window.StorePress;
  })

  afterEach(() => {
    manager.removeAll()
  })

  describe('add()', () => {
    it('adds event listener to element', () => {
      const handler = jest.fn()
      manager.add(element, 'click', handler)

      element.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('adds event listener using selector string', () => {
      const handler = jest.fn()
      manager.add('#test', 'click', handler)

      element.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('adds listeners to multiple elements', () => {
      document.body.innerHTML = `
					<div class="multi">1</div>
					<div class="multi">2</div>
				`

      const handler = jest.fn()
      manager.add('.multi', 'click', handler)

      const elements = document.querySelectorAll('.multi')
      elements[0].click()
      elements[1].click()

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('supports event options like once', () => {
      const handler = jest.fn()
      manager.add(element, 'click', handler, { once: true })

      element.click()
      element.click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('supports passive option', () => {
      const handler = jest.fn()
      manager.add(element, 'scroll', handler, { passive: true })

      expect(() =>
        manager.trigger(element, 'scroll'),
      ).not.toThrow()
    })
  })

  describe('remove()', () => {
    it('removes event listener from element', () => {
      const handler = jest.fn()
      manager.add(element, 'click', handler)
      manager.remove(element, 'click')

      element.click()

      expect(handler).not.toHaveBeenCalled()
    })

    it('removes specific event type only', () => {
      const clickHandler = jest.fn()
      const customHandler = jest.fn()

      manager.add(element, 'click', clickHandler)
      manager.add(element, 'customEvent', customHandler)
      manager.remove(element, 'click')

      element.click()
      manager.trigger(element, 'customEvent')

      expect(clickHandler).not.toHaveBeenCalled()
      expect(customHandler).toHaveBeenCalled()
    })

    it('removes all events from element when type is null', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      manager.add(element, 'event1', handler1)
      manager.add(element, 'event2', handler2)
      manager.remove(element, null)

      const info = manager.get(element)
      expect(info[0].$events.length).toBe(0)
    })
  })

  describe('trigger()', () => {
    it('triggers custom events', () => {
      const handler = jest.fn()
      manager.add(element, 'customEvent', handler)
      manager.trigger(element, 'customEvent', { data: 'test' })

      expect(handler).toHaveBeenCalled()
    })

    it('passes event details', () => {
      const handler = jest.fn()
      manager.add(element, 'dataEvent', handler)
      manager.trigger(element, 'dataEvent', {
        foo: 'bar',
        num: 42,
      })

      expect(handler).toHaveBeenCalled()
      const event = handler.mock.calls[0][0]
      expect(event.detail.foo).toBe('bar')
      expect(event.detail.num).toBe(42)
    })
  })

  describe('removeAll()', () => {
    it('removes all events for namespace', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      manager.add(element, 'event1', handler1)
      manager.add(element, 'event2', handler2)
      manager.removeAll()

      manager.trigger(element, 'event1')
      manager.trigger(element, 'event2')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('removes events from multiple elements', () => {
      const element2 = document.createElement('div')
      document.body.appendChild(element2)

      const handler1 = jest.fn()
      const handler2 = jest.fn()

      manager.add(element, 'click', handler1)
      manager.add(element2, 'click', handler2)
      manager.removeAll()

      const allEvents = manager.getAll()
      expect(allEvents.length).toBe(0)
    })
  })

  describe('get()', () => {
    it('returns event info for element', () => {
      manager.add(element, 'click', jest.fn())
      manager.add(element, 'mouseenter', jest.fn())

      const info = manager.get(element)

      expect(info.length).toBe(1)
      expect(info[0].$events.length).toBe(2)
    })

    it('returns event info with native type detection', () => {
      manager.add(element, 'click', jest.fn())

      const info = manager.get(element)
      const clickEvent = info[0].$events.find((e) =>
        e.nativeType === 'click',
      )

      expect(clickEvent).toBeDefined()
      expect(clickEvent.isNative).toBe(true)
    })
  })

  describe('getAll()', () => {
    it('returns all events in namespace', () => {
      const element2 = document.createElement('div')
      document.body.appendChild(element2)

      manager.add(element, 'click', jest.fn())
      manager.add(element2, 'click', jest.fn())

      const allEvents = manager.getAll()

      expect(allEvents.length).toBe(2)
    })

    it('returns empty array when no events registered', () => {
      const emptyManager = createEventManager('empty-ns')
      const allEvents = emptyManager.getAll()

      expect(allEvents).toEqual([])
    })
  })

  describe('custom prefix and separator', () => {
    it('handles custom prefix option', () => {
      const customManager = createEventManager('custom-ns', {
        prefix: 'myapp',
        separator: '/',
      })

      const handler = jest.fn()
      customManager.add(element, 'custom', handler)
      customManager.trigger(element, 'custom')

      expect(handler).toHaveBeenCalled()

      customManager.removeAll()
    })
  })
})
