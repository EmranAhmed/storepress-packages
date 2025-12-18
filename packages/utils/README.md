# @storepress/utils

A powerful JavaScript utility library for building modular, reusable plugins with a consistent API pattern. Designed for creating DOM-based plugins with automatic instance management, event handling, lifecycle control. and configuration parsing.

[![npm version](https://img.shields.io/npm/v/@storepress/utils.svg)](https://www.npmjs.com/package/@storepress/utils)
[![License: GPL-3.0+](https://img.shields.io/badge/License-GPL--3.0+-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)

## Features

- **Plugin Base Class** — Abstract class for building consistent, reusable plugins
- **Automatic Instance Management** — Track and retrieve plugin instances globally
- **Data Attribute Configuration** — Parse settings from HTML data attributes (JSON or individual attributes)
- **Event System** — Built-in custom event dispatching with `triggerEvent`
- **DOM Utilities** — Helper functions for common DOM operations
- **Global Plugin Registry** — Access plugins and instances from anywhere via `StorePress.Utils`
- **Lifecycle Hooks** — `init`, `destroy`, `setup`, `clear` methods for complete control
- **WordPress Compatible** — Works seamlessly with WordPress and WooCommerce projects

## Installation

Install the module:

```bash
npm install @storepress/utils --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._


## Core Concepts

The library provides utilities for:

- **Case conversion** - Transform strings between naming conventions
- **DOM selection** - Flexible element selection with consistent output
- **Configuration parsing** - Extract options from data attributes with type conversion
- **Event management** - Namespaced event handling with automatic cleanup
- **Plugin creation** - Full lifecycle management for DOM-based plugins

## Usages

**Creating a Plugin (`Plugin.js`):**

```javascript

// Plugin.js



// Define your plugin logic
function Plugin(element, options) {
  
    const reset = () => {
        element.textContent = ''
    }
    
    // Expose to public.
    const expose = () => ({
        reset,
        handleNext
    })
    
    const init = () => {
        element.textContent = options.message || 'Hello!'
        return expose()
    }
    
    return init()
}


// index.js

import { createStorePressPlugin } from '@storepress/utils'

// Create and setup the plugin
const MyPluginManager = createStorePressPlugin({
    selector: '[data-my-plugin]',
    plugin: MyPlugin,
    namespace: 'my-plugin',
    options: { message: 'Default message' },
})

MyPluginManager.setup()

export default MyPluginManager
```

**Using the Plugin (`script.js`):**

```javascript
import MyPluginManager from './my-plugin';

document.addEventListener( 'DOMContentLoaded', () => {
    MyPluginManager.init();
} );
```

**HTML:**

```html
<div data-my-plugin>Loading...</div>
```

---

**Example Plugin `Plugin.js`**
```js
/**
 * External dependencies
 */
import { getOptionsFromAttribute } from '@storepress/utils';

function Plugin(element, options) {
  // Default Settings
  const DEFAULTS = {
    item: 3,
    size: 20,
  }

  // Collecting settings from html attribute
  const ATTRIBUTE = 'slider-settings' // data-slider-settings

  const handleInput = (event) => {
    window.console.log(event.target.value)
  }

  const addEvents = () => {
    this.$element.querySelectorAll('input').forEach(($el) => {
      $el.addEventListener('input', handleInput, { passive: true, signal: this.controller.signal })
    })
  }

  const addClass = () => {
    this.$element.querySelectorAll('input').forEach(($el) => {
      $el.classList.add('example-input-class')
    })
  }

  const removeClass = () => {
    this.$element.querySelectorAll('input').forEach(($el) => {
      $el.classList.remove('example-input-class')
    })
  }

  const removeEvents = () => {
    this.controller.abort()
  }

  const reset = () => {
    removeEvents()
    removeClass()
  }
  
  const handleNext = () =>{
    
  }

  // Expose to public.
  const expose = () => ({
    reset,
    handleNext
  })

  // Do what you need and return expose fn.
  const init = () => {
    this.$element = element
    this.settings = {
      ...DEFAULTS,
      ...options,
      ...getOptionsFromAttribute( this.$element, ATTRIBUTE) // Remember that all number like string and yes|no|true|false string will be converted.
    };

    this.controller = new AbortController()

    addClass()

    addEvents()

    return expose()
  }

  return init()
}

export { Plugin };
```
**Create Plugin System `slider.js` or `index.js`**
```js
/**
 * External dependencies
 */
import { createStorePressPlugin } from '@storepress/utils'
import { Plugin } from 'Plugin'

const StorePressSlider = createStorePressPlugin({
  selector: '[data-slider-settings]',
  options: { size: 50},
  plugin: Plugin,
  namespace: 'slider',
})

// Setup the event listeners
StorePressSlider.setup()

export default StorePressSlider
```

**Usages example `scripts.js`**

```js

import { StorePressSlider } from 'slider'

domReady(function () {
  StorePressSlider.init() // Setup element events to interact by user.

  StorePressSlider.destroy() // Destroy attached events from default elements.
  StorePressSlider.reload() // Destroy events and reattach for default elements.

  StorePressSlider.clear() // Completely remove plugin system events and element events.
  StorePressSlider.setup() // Setup plugin system events to init, destroy and reload.
  // NOTE: Must use StorePressSlider.init() after every StorePressSlider.setup()
})
```

**Example markup**

```html
<div id="container">
    <div class="slider-wrapper inp" data-slider-settings="{'size': 40}">
        <a>1</a>
        <form>
            <input type="text" placeholder="Location X">
        </form>
    </div>

    <div class="slider-wrapper inp" data-slider-settings--size="30">
        <a>2</a>
        <form>
            <input type="text" placeholder="Location Y">
        </form>
    </div>
</div>
```


## API Reference

### Event Manager Documentation

`createEventManager` provides a structured way to manage DOM event listeners with:

- **Namespacing** - Isolate events by component/feature
- **Automatic Cleanup** - Remove all listeners with a single call using `AbortController`
- **Event Tracking** - Know exactly which events are attached to which elements
- **Custom Events** - Trigger both native and custom events seamlessly
- **Memory Safety** - Prevent memory leaks from orphaned event listeners

---

#### The Problem It Solves

##### Problem 1: Memory Leaks from Orphaned Listeners

**Without Event Manager:**

```javascript
class Slider {
    constructor(element) {
        this.element = element;
        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Adding listeners
        this.element.addEventListener('click', this.handleClick);
        window.addEventListener('resize', this.handleResize);
    }
    
    handleClick() { /* ... */ }
    handleResize() { /* ... */ }
    
    destroy() {
        // Must manually track and remove each listener
        // Easy to forget one, causing memory leaks
        this.element.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.handleResize);
        // What if we added more listeners? Easy to miss them!
    }
}
```

**With Event Manager:**

```javascript
class Slider {
    constructor(element) {
        this.element = element;
        this.events = createEventManager('slider');
        
        // Adding listeners - automatically tracked
        this.events.add(this.element, 'click', () => this.handleClick());
        this.events.add(window, 'resize', () => this.handleResize());
    }
    
    handleClick() { /* ... */ }
    handleResize() { /* ... */ }
    
    destroy() {
        // Single call removes ALL listeners - no memory leaks
        this.events.removeAll();
    }
}
```

##### Problem 2: Tracking Which Events Are Attached

**Without Event Manager:**

```javascript
// No way to know what's attached to an element
element.addEventListener('click', handler1);
element.addEventListener('click', handler2);
element.addEventListener('mouseenter', handler3);

// How many listeners? Which types? No built-in way to check!
```

**With Event Manager:**

```javascript
const events = createEventManager('my-component');

events.add(element, 'click', handler1);
events.add(element, 'click', handler2);
events.add(element, 'mouseenter', handler3);

// Get all events for an element
const info = events.get(element);
console.log(info);
// [{
//     $element: element,
//     $events: [
//         { eventType: 'storepress:my_component:click', isNative: true, nativeType: 'click' },
//         { eventType: 'storepress:my_component:mouseenter', isNative: true, nativeType: 'mouseenter' }
//     ]
// }]

// Get all events in namespace
const allEvents = events.getAll();
```

##### Problem 3: Component Isolation

**Without Event Manager:**

```javascript
// Component A
document.addEventListener('click', handleClickA);

// Component B
document.addEventListener('click', handleClickB);

// Removing Component A's listener might accidentally affect Component B
// if handlers get mixed up or references are lost
```

**With Event Manager:**

```javascript
// Component A - isolated namespace
const eventsA = createEventManager('component-a');
eventsA.add(document, 'click', handleClickA);

// Component B - isolated namespace
const eventsB = createEventManager('component-b');
eventsB.add(document, 'click', handleClickB);

// Removing Component A's events doesn't affect Component B
eventsA.removeAll(); // Only removes component-a events
```

##### Problem 4: Triggering Events Consistently

**Without Event Manager:**

```javascript
// Native event
element.dispatchEvent(new Event('click', { bubbles: true }));

// Custom event with data
element.dispatchEvent(new CustomEvent('slideChange', {
    bubbles: true,
    cancelable: true,
    detail: { index: 3 }
}));

// Different syntax for different event types - inconsistent!
```

**With Event Manager:**

```javascript
const events = createEventManager('slider');

// Both native and custom events use the same API
events.trigger(element, 'click');
events.trigger(element, 'slideChange', { index: 3 });
```

#### API Reference

##### `createEventManager(namespace, options)`

Creates a new event manager instance.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `namespace` | `string` | Required | Unique identifier for this event group |
| `options.prefix` | `string` | `'storepress'` | Prefix for event names |
| `options.separator` | `string` | `':'` | Separator between namespace parts |

**Returns:** `EventManager` object with methods: `add`, `remove`, `removeAll`, `trigger`, `get`, `getAll`

```javascript
// Default options
const events = createEventManager('slider');
// Event names: storepress:slider:click

// Custom prefix
const events = createEventManager('slider', { prefix: 'myapp' });
// Event names: myapp:slider:click

// Custom separator
const events = createEventManager('slider', { prefix: 'app', separator: '.' });
// Event names: app.slider.click

// No prefix (global events)
const events = createEventManager('slider', { prefix: '' });
// Event names: $global:slider:click
```

---

##### `events.add(targets, eventType, handler, options)`

Attaches event listeners to elements.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `string \| Element \| NodeList \| Array` | Target element(s) - CSS selector or element reference |
| `eventType` | `string` | Event type (e.g., 'click', 'mouseenter', 'customEvent') |
| `handler` | `Function` | Event handler function |
| `options` | `Object` | Standard addEventListener options (`passive`, `once`, `capture`) |

```javascript
// CSS selector
events.add('#button', 'click', handleClick);

// Element reference
events.add(buttonElement, 'click', handleClick);

// Multiple elements
events.add('.buttons', 'click', handleClick);

// With options
events.add('#button', 'click', handleClick, { passive: true, once: true });

// Document-level events
events.add(document, 'keydown', handleKeydown);

// Window events
events.add(window, 'resize', handleResize);
```

---

##### `events.remove(targets, eventType)`

Removes event listeners from elements.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `string \| Element \| NodeList \| Array` | Target element(s) |
| `eventType` | `string \| null` | Event type to remove, or `null` to remove all events from element |

```javascript
// Remove specific event type
events.remove('#button', 'click');

// Remove all events from element
events.remove('#button', null);

// Remove from multiple elements
events.remove('.buttons', 'click');
```

---

##### `events.removeAll()`

Removes all event listeners in this namespace from all elements.

```javascript
events.removeAll();
```

---

##### `events.trigger(targets, eventType, details, options)`

Dispatches events on elements.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | `string \| Element \| NodeList \| Array` | Required | Target element(s) |
| `eventType` | `string \| null` | `null` | Event type to trigger, or `null` for all events |
| `details` | `Object` | `{}` | Data to include in event.detail |
| `options` | `Object` | `{}` | CustomEvent options (`bubbles`, `cancelable`, `composed`) |

```javascript
// Trigger native event
events.trigger('#button', 'click');

// Trigger custom event with data
events.trigger('#slider', 'slideChange', { 
    currentIndex: 3,
    previousIndex: 2 
});

// Trigger with bubbling
events.trigger('#button', 'customEvent', { data: 'test' }, { bubbles: true });

// Trigger all events on element
events.trigger('#button', null);
```

---

##### `events.get(targets)`

Gets information about events attached to specific elements.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `string \| Element \| NodeList \| Array` | Target element(s) |

**Returns:** `Array<{ $element: Element, $events: Array<EventInfo> }>`

```javascript
const info = events.get('#button');
// [{
//     $element: <button>,
//     $events: [
//         { eventType: 'storepress:my_component:click', isNative: true, nativeType: 'click' },
//         { eventType: 'storepress:my_component:focus', isNative: true, nativeType: 'focus' }
//     ]
// }]
```

---

##### `events.getAll()`

Gets information about all events in this namespace.

**Returns:** `Array<{ $element: Element, $events: Array<EventInfo> }>`

```javascript
const allEvents = events.getAll();
// [
//     { $element: <button>, $events: [...] },
//     { $element: <div>, $events: [...] },
//     ...
// ]
```

---

#### Basic Usage

##### Simple Component Example

```javascript
import { createEventManager } from '@storepress/utils';

function createCounter(element) {
    const events = createEventManager('counter');
    let count = 0;
    
    const $display = element.querySelector('.count');
    const $increment = element.querySelector('.increment');
    const $decrement = element.querySelector('.decrement');
    
    const updateDisplay = () => {
        $display.textContent = count;
        events.trigger(element, 'countChange', { count });
    };
    
    const increment = () => {
        count++;
        updateDisplay();
    };
    
    const decrement = () => {
        count--;
        updateDisplay();
    };
    
    // Setup events
    events.add($increment, 'click', increment);
    events.add($decrement, 'click', decrement);
    
    // Cleanup function
    const destroy = () => {
        events.removeAll();
    };
    
    return { increment, decrement, destroy };
}

// Usage
const counter = createCounter(document.querySelector('.counter'));

// Listen for custom events
document.querySelector('.counter').addEventListener('storepress:counter:countChange', (e) => {
    console.log('Count changed:', e.detail.count);
});

// Cleanup when done
counter.destroy();
```

---

#### Use Cases

##### Use Case 1: Modal Dialog

A modal component with keyboard handling, overlay clicks, and focus management.

```javascript
import { createEventManager, getElement } from '@storepress/utils';

function createModal(selector) {
    const element = getElement(selector);
    const events = createEventManager('modal');
    
    let isOpen = false;
    let previouslyFocused = null;
    
    const $overlay = element.querySelector('.modal-overlay');
    const $dialog = element.querySelector('.modal-dialog');
    const $closeBtn = element.querySelector('.modal-close');
    const $triggers = document.querySelectorAll(`[data-modal-trigger="${element.id}"]`);
    
    const open = () => {
        if (isOpen) return;
        
        previouslyFocused = document.activeElement;
        isOpen = true;
        element.hidden = false;
        element.classList.add('is-open');
        
        // Focus first focusable element
        const focusable = $dialog.querySelector('button, input, [tabindex="0"]');
        focusable?.focus();
        
        // Add active-state events
        events.add(document, 'keydown', handleKeydown);
        events.add($overlay, 'click', close);
        
        events.trigger(element, 'open', { modal: element });
    };
    
    const close = () => {
        if (!isOpen) return;
        
        isOpen = false;
        element.classList.remove('is-open');
        
        setTimeout(() => {
            element.hidden = true;
            previouslyFocused?.focus();
        }, 300);
        
        // Remove active-state events
        events.remove(document, 'keydown');
        events.remove($overlay, 'click');
        
        events.trigger(element, 'close', { modal: element });
    };
    
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            close();
        }
        
        // Focus trap
        if (e.key === 'Tab') {
            const focusables = $dialog.querySelectorAll(
                'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    
    // Setup permanent events
    events.add($closeBtn, 'click', close);
    $triggers.forEach($trigger => {
        events.add($trigger, 'click', open);
    });
    
    const destroy = () => {
        close();
        events.removeAll();
    };
    
    return { open, close, destroy, isOpen: () => isOpen };
}

// Usage
const modal = createModal('#my-modal');

// Listen for modal events
document.querySelector('#my-modal').addEventListener('storepress:modal:open', () => {
    console.log('Modal opened');
});

document.querySelector('#my-modal').addEventListener('storepress:modal:close', () => {
    console.log('Modal closed');
});
```


## Best Practices

### 1. Always Clean Up

```javascript
// ✅ Good - cleanup on destroy
function createComponent(element) {
    const events = createEventManager('component');
    
    events.add(element, 'click', handleClick);
    
    return {
        destroy() {
            events.removeAll(); // Clean up all events
        }
    };
}

// ❌ Bad - no cleanup
function createComponent(element) {
    const events = createEventManager('component');
    
    events.add(element, 'click', handleClick);
    
    return {}; // Memory leak!
}
```

### 2. Use Descriptive Namespaces

```javascript
// ✅ Good - descriptive namespace
const modalEvents = createEventManager('product-modal');
const sliderEvents = createEventManager('hero-slider');

// ❌ Bad - generic namespace
const events1 = createEventManager('events');
const events2 = createEventManager('stuff');
```

### 3. Conditional Event Attachment

```javascript
// ✅ Good - add/remove events based on state
const open = () => {
    isOpen = true;
    events.add(document, 'keydown', handleEscape);
    events.add($overlay, 'click', close);
};

const close = () => {
    isOpen = false;
    events.remove(document, 'keydown');
    events.remove($overlay, 'click');
};

// ❌ Bad - always listening even when not needed
events.add(document, 'keydown', (e) => {
    if (isOpen && e.key === 'Escape') {
        close();
    }
});
```

### 4. Use Passive Listeners for Scroll/Touch

```javascript
// ✅ Good - passive for performance
events.add(window, 'scroll', handleScroll, { passive: true });
events.add(element, 'touchstart', handleTouch, { passive: true });

// ❌ Bad - blocking scroll events
events.add(window, 'scroll', handleScroll);
```

### 5. Separate Concerns with Multiple Managers

```javascript
// ✅ Good - separate managers for different concerns
function createComponent(element) {
    const uiEvents = createEventManager('component-ui');
    const dataEvents = createEventManager('component-data');
    
    // UI interactions
    uiEvents.add(element, 'click', handleClick);
    uiEvents.add(element, 'mouseenter', handleHover);
    
    // Data events
    dataEvents.add(element, 'dataLoaded', handleDataLoaded);
    dataEvents.add(element, 'dataError', handleDataError);
    
    return {
        destroy() {
            uiEvents.removeAll();
            dataEvents.removeAll();
        }
    };
}
```

---

#### Common Patterns

##### Pattern 1: Event Delegation

```javascript
const events = createEventManager('list');

// Instead of attaching to each item
events.add(listContainer, 'click', (e) => {
    const $item = e.target.closest('.list-item');
    if ($item) {
        handleItemClick($item);
    }
    
    const $deleteBtn = e.target.closest('.delete-btn');
    if ($deleteBtn) {
        handleDelete($deleteBtn.closest('.list-item'));
    }
});
```

##### Pattern 2: One-Time Events

```javascript
const events = createEventManager('animation');

// Remove after first trigger
events.add(element, 'transitionend', (e) => {
    handleTransitionEnd(e);
    events.remove(element, 'transitionend');
}, { once: true });
```

##### Pattern 3: Debounced Events

```javascript
const events = createEventManager('search');

let debounceTimer;

events.add(input, 'input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});
```

##### Pattern 4: Event Chaining

```javascript
const events = createEventManager('wizard');

// Step completion triggers next step
events.add(step1, 'complete', () => {
    events.trigger(step2, 'activate');
});

events.add(step2, 'complete', () => {
    events.trigger(step3, 'activate');
});

events.add(step3, 'complete', () => {
    events.trigger(wizard, 'finished');
});
```

---

#### Debugging

###### List All Events

```javascript
const events = createEventManager('my-component');

// Setup some events
events.add('#btn1', 'click', handler1);
events.add('#btn2', 'click', handler2);
events.add(document, 'keydown', handler3);

// Debug: see all events
console.table(events.getAll().flatMap(({ $element, $events }) => 
    $events.map(e => ({
        element: $element.tagName + ($element.id ? `#${$element.id}` : ''),
        eventType: e.eventType,
        isNative: e.isNative,
        nativeType: e.nativeType
    }))
));
```

##### Check Specific Element

```javascript
const info = events.get('#my-button');
console.log('Events on button:', info[0]?.$events || 'None');
```

##### Global Event Store Access

```javascript
// Access the global event store (for debugging only)
console.log(window.StorePress.$Events);
```

## Summary

`createEventManager` solves common event handling problems:

| Problem | Solution |
|---------|----------|
| Memory leaks | `removeAll()` cleans everything |
| Lost references | Events tracked automatically |
| No visibility | `get()` and `getAll()` for inspection |
| Inconsistent API | Same API for native and custom events |
| Component isolation | Namespaced event groups |
| Cleanup complexity | Single call removes all listeners |

Use it whenever you need reliable, trackable, cleanable event management in your DOM-based components.

---

### Case Conversion Functions

#### `toKebabCase(string)`

Converts strings to kebab-case format.

```javascript
import { toKebabCase } from '@storepress/utils';

toKebabCase('firstName');        // 'first-name'
toKebabCase('UserProfile');      // 'user-profile'
toKebabCase('api_endpoint');     // 'api-endpoint'
toKebabCase('hello world');      // 'hello-world'
```

#### `toSnakeCase(string)`

Converts strings to snake_case format.

```javascript
import { toSnakeCase } from '@storepress/utils';

toSnakeCase('firstName');        // 'first_name'
toSnakeCase('UserProfile');      // 'user_profile'
toSnakeCase('api-endpoint');     // 'api_endpoint'
```

#### `toConstantCase(string)`

Converts strings to CONSTANT_CASE format.

```javascript
import { toConstantCase } from '@storepress/utils';

toConstantCase('apiKey');        // 'API_KEY'
toConstantCase('maxRetries');    // 'MAX_RETRIES'
toConstantCase('database-url');  // 'DATABASE_URL'
```

#### `toCamelCase(string)`

Converts strings to camelCase format.

```javascript
import { toCamelCase } from '@storepress/utils';

toCamelCase('user-profile');     // 'userProfile'
toCamelCase('api_endpoint');     // 'apiEndpoint'
toCamelCase('hello world');      // 'helloWorld'
```

#### `toUpperCamelCase(string)`

Converts strings to PascalCase format.

```javascript
import { toUpperCamelCase } from '@storepress/utils';

toUpperCamelCase('user-profile');    // 'UserProfile'
toUpperCamelCase('api_endpoint');    // 'ApiEndpoint'
toUpperCamelCase('hello world');     // 'HelloWorld'
```

---

### DOM Selection

#### `getElement(selector)`

Returns a single HTMLElement or null.

```javascript
import { getElement } from '@storepress/utils';

// CSS selector
const button = getElement('#submit-btn');

// Existing element (passed through)
const element = document.querySelector('.card');
const same = getElement(element); // Returns same reference

// Null handling
getElement(null);      // null
getElement();          // null
```

#### `getElements(selectors)`

Returns a collection of HTMLElements.

```javascript
import { getElements } from '@storepress/utils';

// CSS selector - returns NodeList
const buttons = getElements('.btn');

// Single element - wrapped in array
const element = document.querySelector('.card');
const wrapped = getElements(element); // [element]

// Array passed through
const elements = [el1, el2, el3];
const same = getElements(elements); // Same reference

// Empty handling
getElements([]);       // []
getElements();         // []
```

---

### Configuration from Data Attributes

#### `getOptionsFromAttribute(element, attributeName, features)`

Parses configuration from HTML data attributes with automatic type conversion and nested structure support.

```html
<div id="slider"
     data-slider='{"autoplay": true, "speed": 500}'
     data-slider--animation--duration="800"
     data-slider--animation--easing="ease-out"
     data-slider-loop="yes"
     data-slider-count="5">
</div>
```

```javascript
import { getOptionsFromAttribute } from '@storepress/utils';

const element = document.getElementById('slider');
const options = getOptionsFromAttribute(element, 'slider');

console.log(options);
// {
//   autoplay: true,
//   speed: 500,
//   animation: {
//     duration: 800,        // Parsed as number
//     easing: 'ease-out'
//   },
//   loop: true,             // 'yes' parsed as boolean
//   count: 5                // Parsed as number
// }
```

**Type Conversion Features:**

| Input | Output | Feature |
|-------|--------|---------|
| `"true"`, `"yes"` | `true` | `parseBoolean` |
| `"false"`, `"no"` | `false` | `parseBoolean` |
| `"42"`, `"3.14"` | `42`, `3.14` | `parseNumber` |
| `"/pattern/gi"` | `/pattern/gi` | `parseRegex` |

**Custom Features:**

```javascript
const options = getOptionsFromAttribute(element, 'config', {
    parseNumber: false,      // Keep numbers as strings
    parseBoolean: true,
    truthyStrings: ['yes', 'true', 'on', '1'],
    falsyStrings: ['no', 'false', 'off', '0'],
    parseRegex: true
});
```

---

### Deep Merge

#### `deepMerge(...sources)`

Recursively merges objects. Arrays are replaced, not concatenated.

```javascript
import { deepMerge } from '@storepress/utils';

const defaults = {
    theme: { color: 'blue', size: 'medium' },
    features: ['search']
};

const custom = {
    theme: { color: 'red' },
    features: ['filter']
};

const merged = deepMerge(defaults, custom);
// {
//   theme: { color: 'red', size: 'medium' },
//   features: ['filter']  // Array replaced, not merged
// }
```

---

#### `triggerEvent(targets, eventType, details, options)`

Dispatches custom events on elements.

```javascript
import { triggerEvent } from '@storepress/utils';

// Basic dispatch
triggerEvent(button, 'customClick', { userId: 123 });

// With options
triggerEvent(form, 'beforeSubmit', { data: formData }, {
    bubbles: true,
    cancelable: true
});

// Listen for custom event
button.addEventListener('customClick', (e) => {
    console.log(e.detail.userId); // 123
});
```

---

### Swipe Detection

#### `swipeEvent(target, callback, options)`

Attaches swipe gesture detection supporting both touch and pointer events.

```javascript
import { swipeEvent } from '@storepress/utils';

const cleanup = swipeEvent(carousel, (event) => {
    const { x, y, left, right, top, bottom, moving, done } = event.detail;

    if (moving) {
        // Live tracking during swipe
        carousel.style.transform = `translateX(${x}px)`;
    }

    if (done) {
        if (left) nextSlide();
        if (right) prevSlide();
        carousel.style.transform = '';
    }
}, {
    offset: 10,        // Minimum pixels for direction detection
    touchOnly: false   // Set true to ignore mouse/pointer events
});

// Cleanup when done
cleanup();
```

---

### Object Path Access

#### `findObjectValue(obj, path, defaultValue, notation)`

Safely access nested object properties using dot/dash/underscore notation.

```javascript
import { findObjectValue } from '@storepress/utils';

const config = {
    database: {
        connection: {
            host: 'localhost',
            port: 5432
        }
    }
};

findObjectValue(config, 'database.connection.host');           // 'localhost'
findObjectValue(config, 'database-connection-port', 3000);     // 5432
findObjectValue(config, 'database.missing', 'default');        // 'default'

// Custom notation
findObjectValue(config, 'database/connection/host', null, ['/']);
```

---

### Regex Escaping

#### `escapeRegex(string)`

Escapes special regex characters for safe pattern creation.

```javascript
import { escapeRegex } from '@storepress/utils';

const userInput = 'Price: $50.99 (sale!)';
const escaped = escapeRegex(userInput);
// 'Price: \\$50\\.99 \\(sale!\\)'

const regex = new RegExp(escaped, 'gi');
console.log(regex.test('Price: $50.99 (sale!)')); // true
```

---

### Getting Slider Instance

```javascript

import {
  getPluginInstance,
  getStorePressPlugin,
  triggerEvent
} from '@storepress/utils';

// Method 1: Get specific plugin instance
const plugin = getPluginInstance('.element', 'slider');

// Method 2: Get via plugin manager
const plugin = getStorePressPlugin('slider').get('.element');

// Method 3: Get all plugin instances
const allSliders = getStorePressPlugin('slider').get();


// OR

// Method 1: Get specific plugin instance
const plugin = StorePress.Utils.getPluginInstance('.element', 'slider');

// Method 2: Get via plugin manager
const plugin = StorePress.Utils.getStorePressPlugin('slider').get('.element');

// Method 3: Get all plugin instances
const allSliders = StorePress.Utils.getStorePressPlugin('slider').get();


allSliders.forEach(instance => {
  instance.handleNext(); // Access plugin exposed functions.
});
```

## Links

- [NPM Package](https://www.npmjs.com/package/@storepress/utils)
- [GitHub Repository](https://github.com/EmranAhmed/storepress-packages)
- [StorePress Slider](https://github.com/EmranAhmed/storepress-slider) (Example implementation)
- [StorePress Tooltip](https://github.com/EmranAhmed/storepress-tooltip) (Example implementation)
- [Storybook Documentation](https://emranahmed.github.io/storepress-packages/)