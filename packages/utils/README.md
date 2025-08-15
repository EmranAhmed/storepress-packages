# Utils

StorePress Utils Library.

## Installation

Install the module:

```bash
npm install @storepress/utils --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

## Usage

```js
import { getOptionsFromAttribute, createPluginInstance, triggerEvent } from '@storepress/utils';
```

```js
// Global Availability.
StorePress.Utils.triggerEvent(...);
```

## Example Plugin `Plugin.js`
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

  // Expose to public.
  const expose = () => ({
    reset
  })

  return init()
}

export { Plugin };
```
## Create Plugin System `slider.js` or `index.js`
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

## Usages example `scripts.js`

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

## Example markup

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