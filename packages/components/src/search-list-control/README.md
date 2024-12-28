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
import { useState } from '@wordpress/element';
import { SearchListControl } from '@storepress/components';

import '@storepress/components/build-style/search-list-control.scss';

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { debounce } from '@wordpress/compose';

export const ProductSearchListControl = ( { attributes, setAttributes } ) => {
  const { query: { productId = 0 } = {} } = attributes;

  const [ queryProductsList, setQueryProductsList ] = useState( [] );
  const [ queryProductSearch, setQueryProductSearch ] = useState( '' );
  const [ isLoading, setIsLoading ] = useState( false );

  const fetchSearchResult = useCallback( async () => {
    setIsLoading( true );
    const perPage = 20;

    const searchResults = await apiFetch( {
      path: addQueryArgs( 'wc/store/v1/products', {
        search: queryProductSearch,
        per_page: perPage,
      } ),
    } ).finally( () => {
      setIsLoading( false );
    } );

    const productResult = await apiFetch( {
      path: addQueryArgs( 'wc/store/v1/products', {
        include: productId,
        per_page: perPage,
      } ),
    } ).finally( () => {
      setIsLoading( false );
    } );

    const currentProduct = [ ...productResult ].at( 0 ) || {};

    const currentProductOption =
      currentProduct.id > 0 ? [ currentProduct ] : [];

    const results = searchResults.reduce( ( products, product ) => {
      if ( product.id === currentProduct?.id ) {
        return products;
      }

      products.push( product );

      return products;
    }, [] );

    return [ ...currentProductOption, ...results ];
  }, [ queryProductSearch ] );

  const onProductSearch = useCallback( ( search ) => {
    // setIsLoading(true);
    setQueryProductSearch( search );
  }, [] );

  const debouncedOnProductSearch = debounce( onProductSearch, 800 );

  const onChangeSearchList = ( id ) => {
    setAttributes( {
      query: {
        ...attributes.query,
        productId: parseInt( id.at( 0 ), 10 ),
      },
    } );
  };

  useEffect( () => {
    ( async () => {
      const products = await fetchSearchResult();

      setQueryProductsList( products );
      setIsLoading( false );
    } )();
  }, [ fetchSearchResult ] );

  return (
    <PanelBody title={ __( 'Product Settings', 'textdomain' ) }>
      <SearchListControl
        disableFilter={ true }
        itemMetaName={ [ 'type' ] }
        items={ queryProductsList }
        selected={ [ productId ] }
        onSelect={ onChangeSearchList }
        onSearch={ debouncedOnProductSearch }
        isLoading={ isLoading }
        placeholder={ __('Search Product', 'textdomain') }
      />
    </PanelBody>
  );
};

export const Example = () => {
  const [sugessionList, setSugessionList] = useState([])
  const [loding, setLoading]              = useState(true)
  
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
  );
}
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

