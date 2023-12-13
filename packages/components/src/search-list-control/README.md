# Search List Control

### `SearchListControl`

Used to render a searchable select list control component.

### Installation

Install the module:

```bash
npm install @storepress/components --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for such language features and APIs, you should include [the polyfill shipped in `@wordpress/babel-preset-default`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/babel-preset-default#polyfill) in your code._

### Usage

```jsx
import { SearchListControl } from '@storepress/components';
import '@storepress/components/build-style/search-list-control.scss';
```

### Props

The component accepts the following props:


#### `id`: `string`

Unique ID for control.

-   Required: no

#### `label`: `string`

Label for the control.

-   Required: no

#### `help`: `string`

Help text for the control placed on bottom of control.

-   Required: no

#### `hideLabelFromVision`: `boolean`

Hide Control Label from display.

-   Default: `false`
-   Required: no

#### `className`: `string`

className for Control.

-   Required: no

#### `items`: `array`

Items for Control.

-   Required: yes

#### `selected`: `array`

Selected items for Control.

-   Required: no

#### `itemKeyName`: `string`

Unique key from item single object.

-   Default: `id`
-   Required: no if `id`

#### `itemValueName`: `array`

Value key from item single object.

-   Default: `[name]`
-   Required: no if `[name]`

#### `itemMetaName`: `array`

Extra data key from item single object.

-   Default: empty
-   Required: no 

#### `itemFilterName`: `array`

Item filter keys to filter items from single object.

-   Default: `['name']`
-   Required: no 

#### `isLoading`: `boolean`

Is loading state or not

-   Default: `false`
-   Required: no 

#### `disableFilter`: `boolean`

Disable show list by text search.

-   Default: `false`
-   Required: no 

#### `isMultiSelect`: `boolean`

Make dropdown with checkbox select or radio select.

-   Default: `false`
-   Required: no 

#### `placeholder`: `string`

Control placeholder text

-   Required: no 

#### `clearText`: `string`

Control clear button text

-   Required: no

#### `noItemsFoundText`: `string`

Control have no item to show message text.

-   Required: no

#### `onSearch`: `( searchString: string ) => void`

A function that receives the new value on the input.

-   Required: no

#### `onSelect`: `( selectedKeys: array, selectedItems: array ) => void`

A function that receives the new value array on the input chosen.

-   Required: no

#### `onClear`: `() => void`

A function execute when clear button clicked.

-   Required: no


### Example:

```js
import { useState } from '@wordpress/element';
import { SearchListControl } from '@storepress/components';
const [sugessionList, setSugessionList] = useState([])
const [loding, setLoading]              = useState(true)

const blockProps = useBlockProps();

const innerBlockProps = useInnerBlocksProps();

// Fetch Attributes
useEffect(() => {
  apiFetch({
     path : 'wc/store/v1/products/attributes',
  }).then((result) => {
    if (result && result.length > 0) {
      setLoading(false)
      setSugessionList(result)
    }
  })
}, []);

return (
  <div {...blockProps}>
    <SearchListControl
      selected={['17', '23', '36']}
      itemKeyName="id"
      itemValueName="title.rendared"
      hideSearchBox={false}
      isMultiSelect={true}
      isLoading={loding}
      onSearch={(searchString) => {
          // return filtered values.
      }}
      onSelect={(selectedKeys, selectedItems) => {
          
      }}
      onClear={() => {
        console.log()
      }}
      items={sugessionList}
    />
    <div {...innerBlockProps} />
  </div>
);
```
