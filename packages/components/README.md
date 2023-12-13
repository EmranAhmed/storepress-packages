# Components

StorePress Components Library.

## Installation

Install the module:

```bash
npm install @storepress/components --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

## Usage

```scss
// style.scss
@import "@storepress/components/build-style/search-list-control";
```

```jsx
import { SearchListControl } from '@storepress/components';
import './style.scss';
```
## Documentation:

- [See `SearchListControl` docs](src/search-list-control/README.md)