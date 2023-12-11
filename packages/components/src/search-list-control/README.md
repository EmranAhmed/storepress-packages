# Search List

## Example:

```js

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
    <SearchList
      selected={['17', '23', '36']}
      itemKeyName="id"
      itemValueName="title.rendared"
      hideSearchBox={false}
      isMultiSelect={true}
      isLoading={loding}
      onSearch={(input) => {
          // return filtered values.
      }}
      onSelect={(item) => {
          
      }}
      onClear={() => {
        console.log()
      }}
      items={sugessionList}
      selected={[]}
    />
    <div {...innerBlockProps} />
  </div>
);
```
