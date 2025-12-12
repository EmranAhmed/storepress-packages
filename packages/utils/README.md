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

**Creating a Plugin (`MyPlugin.js`):**

```javascript
import { createStorePressPlugin } from '@storepress/utils';

// Define your plugin logic
function MyPlugin(element, options) {
    const init = () => {
        element.textContent = options.message || 'Hello!';
        return { reset };
    };

    const reset = () => {
        element.textContent = '';
    };

    return init();
}

// Create and setup the plugin
const MyPluginManager = createStorePressPlugin({
    selector: '[data-my-plugin]',
    plugin: MyPlugin,
    namespace: 'my-plugin',
    options: { message: 'Default message' }
});

MyPluginManager.setup();

export default MyPluginManager;
```

**Using the Plugin (`index.js`):**

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

----------------

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
     data-slider-animation-duration="800"
     data-slider-animation-easing="ease-out"
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