/**
 * Tests for event utility functions
 *
 * @package @storepress/utils
 */

import { triggerEvent, swipeEvent, createEventManager, getEventStore } from '../src'

describe('@storepress/utils - Event Utilities', () => {
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

  describe( 'getEventStore', () => {
    it( 'creates and returns a Map', () => {
      const store = getEventStore( 'test-events' );
      expect( store ).toBeInstanceOf( Map );
    } );

    it( 'returns same Map for same namespace', () => {
      const store1 = getEventStore( 'events' );
      const store2 = getEventStore( 'events' );
      expect( store1 ).toBe( store2 );
    } );
  } );

})