# Components

StorePress Components Library.

## Installation

Install the module:

```bash
npm install @storepress/components --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

## Usage

```jsx
import { SearchListControl } from '@storepress/components';
```

### Styles

Component styles ship as SCSS in `build-style/`, one file per component. Load them in either of these ways.

Import the stylesheet from JavaScript:

```jsx
import '@storepress/components/build-style/search-list-control.scss';
```

Or load it from your own stylesheet with `@use`:

```scss
// style.scss
@use "~@storepress/components/build-style/search-list-control";
```

```jsx
import './style.scss';
```

_The stylesheets are compiled by your build, so it needs a Sass setup that resolves packages from `node_modules`, such as `sass-loader` with webpack (included in `@wordpress/scripts`). Use `@use` rather than `@import`, which is deprecated in Dart Sass._

## Documentation:

- [See `SearchListControl` docs](src/search-list-control/README.md)
- [See `UnitRangeControl` docs](src/unit-range-control/README.md)