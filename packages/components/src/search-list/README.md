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
      valueKey='id'
      valueName='title.rendared'
      hideSearchBox={false}
      isMultiSelect={true}
      isLoading={loding}
      onSearch={(input) => {
        console.log(input)
      }}
      onSelect={(item) => {
        console.log(item)
      }}
      onClear={() => {
        console.log()
      }}
      suggestions={sugessionList}
    />
    <div {...innerBlockProps} />
  </div>
);
```
