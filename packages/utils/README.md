# Utils

StorePress Icons Library.

## Installation

Install the module:

```bash
npm install @storepress/utils --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

## Usage

```js
import { getOptionsFromAttribute, createPluginInstance } from '@storepress/utils';
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
        pointerSize: 20,
    };

    // Collecting settings from html attribute
    const ATTRIBUTE = 'slider-settings';

    // Do what you need and return expose fn.
    const init = () => {
        this.element = element;
        this.settings = Object.assign(
            {},
            DEFAULTS,
            options,
            getOptionsFromAttribute(this.element, ATTRIBUTE)
        );
        //  console.log('init')
        addEvents();

        return expose();
    };

    const addPointer = (event) => {
        window.console.log(event.target.value);
    };

    const addEvents = () => {
        this.element.querySelectorAll('input').forEach((el) => {
            el.addEventListener('input', addPointer);
        });
    };

    const removeEvents = () => {
        this.element.querySelectorAll('input').forEach((el) => {
            el.removeEventListener('input', addPointer);
        });
    };

    // Expose to public.
    const expose = () => ({
        removeEvents,
    });

    return (() => init())();
}

export { Plugin };
```
## Make Plugin Instance `frontend.js`
```js
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { createPluginInstance } from '@storepress/utils';

domReady(function () {
	// Attach with window to access Slider globally.
	const Slider = {
		getInstance(element, options) {
			return createPluginInstance(element, options, Plugin);
		},

		initWith(el, options) {
			for (const { element, destroy, removeEvents } of this.getInstance(
				el,
				options
			)) {
				element.addEventListener('destroy', removeEvents);
			}
		},

		init(options) {
			for (const { element, destroy, removeEvents } of this.getInstance(
				'.inp',
				options
			)) {
				element.addEventListener('destroy', removeEvents);
			}
		},

		destroyWith(el) {
			for (const { element, destroy, removeEvents } of this.getInstance(
				el
			)) {
				destroy();
			}
		},

		destroy() {
			for (const { element, destroy, removeEvents } of this.getInstance(
				'.inp'
			)) {
				destroy();
			}
		},
	};

    // Method: 01
	// Slider.init()

    // Method: 01 destroy inctance
	// Slider.destroy()

	//////

	// If you do not want to attach Slider to window. use event.
	document.addEventListener('slider_init_with_options', (event) => {
		const defaultSettings = { pointerSize: 30 };
		const settings = { ...defaultSettings, ...event.detail?.settings };

		Slider.init(settings);
	});

	const slider_init_with_options = new CustomEvent(
		'slider_init_with_options',
		{
			detail: {
				settings: {
					pointerSize: 80,
				},
			},
		}
	);

    // Method: 02 init
	// document.dispatchEvent(slider_init_with_options)

	document.addEventListener('slider_init', (event) => {
		Slider.init();
	});

    // Method: 02 init
	// document.dispatchEvent(new Event('slider_init'));

	document.addEventListener('slider_destroy', (event) => {
		Slider.destroy();
	});

    // Method: 02 destroy inctance
	// document.dispatchEvent(new Event('slider_destroy')) //  run when you want to destroy slider instances
});
```

## Example markup

```html
<div id="container">

    <div class="slider-wrapper inp" data-slider-settings="{'pointerSize': 40}">
        <a>1</a>
        <form>
            <input type="text" placeholder="Location X">
        </form>
    </div>

    <div class="slider-wrapper inp" data-slider-settings="{'pointerSize': 30}">
        <a>2</a>
        <form>
            <input type="text" placeholder="Location Y">
        </form>
    </div>

</div>
```