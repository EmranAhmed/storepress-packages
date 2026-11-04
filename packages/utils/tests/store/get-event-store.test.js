/**
 * Tests for getEventStore
 *
 * @package @storepress/utils
 */

/**
 * Internal dependencies
 */
import { getEventStore } from '../../src/store/get-event-store.js';

describe('getEventStore', () => {
  beforeEach(() => {
    delete window.StorePress
    document.body.innerHTML = ''
  })

  it( 'creates and returns a Map', () => {
    const store = getEventStore( 'test-events' );
    expect( store ).toBeInstanceOf( Map );
  } );

  it( 'returns same Map for same namespace', () => {
    const store1 = getEventStore( 'events' );
    const store2 = getEventStore( 'events' );
    expect( store1 ).toBe( store2 );
  } );
})
