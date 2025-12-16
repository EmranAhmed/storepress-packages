# Unit Range Control

### `UnitRangeControl`

`UnitRangeControl` allows the user to set a numeric quantity as well as a unit (e.g. px) with a range of incremental values.

### Installation

Install the module:

```bash
npm install @storepress/components --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

### Usage

```jsx
import { useState } from '@wordpress/element';
import { UnitRangeControl } from '@storepress/components';

const Example = () => {
  const [ value, setValue ] = useState( '10px' );

  return <UnitRangeControl
            label={"Label"}
            onChange={ ( value ) => setValue( value ) } 
            value={ value }
            allowedUnits={['%', 'px', 'em', 'rem', 's', 'ms']}
  />;
};
```

### Props

The component accepts the following props:

#### label

If this property is added, a label will be generated using label property as the content.

-   Type: `String`
-   Required: Yes
- 
#### value

If this property is added, a value is added as number.

-   Type: `Number`
-   Required: Yes


#### onChange

Callback when the `value` changes.

-   Type: `Function`
-   Required: Yes


#### allowedUnits

Select some of unit like.

-   Type: `String[]`
-   Required: No
-   Default: `['%', 'px', 'em', 'rem', 's', 'ms']`

#### defaultUnits

Collection of available units. These units must be one of the units defined in the `theme.json` settings file.

-   Type: `{ value: string, label: string, default: number, min: number, max: number, step: number }[]`
-   Required: No
-   Default: 
```js
[
  { value: 'px', label: 'px', default: 0, min: 0, max: 1000, step: 1 },
  { value: '%', label: '%', default: 0, min: 0, max: 100, step: 0.1 },
  { value: 'em', label: 'em', default: 0, min: 0, max: 50, step: 0.01 },
  { value: 'rem', label: 'rem', default: 0, min: 0, max: 50, step: 0.01 },
  { value: 's', label: 's', default: 0, min: 0, max: 120, step: 0.1 },
  { value: 'ms', label: 'ms', default: 0, min: 0, max: 120000, step: 100 },
  { value: 'fr', label: 'fr', default: 1, min: 1, max: 100, step: 1 },
]
```

#### convertUnits

Smooth user experience to change unit values from one to another. Like `1rem` = `16px`.

-   Type: `{ fromUnits: string[], toUnits: string[], operator: string, digit: number }[]`
-   Required: No
-   Default:

```js
 [
  { fromUnits: ['em', 'rem'], toUnits: ['px'], operator: '*', digit: 16 },
  { fromUnits: ['px'], toUnits: ['em', 'rem'], operator: '/', digit: 16 },
  { fromUnits: ['s'], toUnits: ['ms'], operator: '*', digit: 1000 },
  { fromUnits: ['ms'], toUnits: ['s'], operator: '/', digit: 1000 },
]
```