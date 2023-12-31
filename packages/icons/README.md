# Icons

StorePress Icons Library.

## Installation

Install the module:

```bash
npm install @storepress/icons --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

## Usage

```js
import { Icon } from '@wordpress/icons';
import { storepress, popup, slider, archiveProduct } from '@storepress/icons';

<Icon icon={ storepress } />;
```

## Available Icons

| Name             | Description         |
|:-----------------|:--------------------|
| `storepress`     | StorePress Icon     |
| `popup`          | Popup Icon          |
| `slider`         | Slider Icon         |
| `archiveProduct` | archiveProduct Icon |

- See [WordPress icons packages](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-icons/)