import { useCallback, useLayoutEffect, useRef } from '@wordpress/element'
import { Icon } from './icon'

export function Input (props) {

  const {
    controlProps,
    searchValue,
    setSearchValue,
    placeholder,
    hideSearchBox,
    onSearch,
  } = props

  if (hideSearchBox) {
    return
  }

  const ref = useRef()

  const handleOnChange = useCallback((event) => {
    const { value } = event?.target
    setSearchValue(value)
  }, [])

  const onFocus = () => {
    ref.current?.focus()
  }

  useLayoutEffect(() => {
    onSearch(searchValue)
  }, [searchValue])

  return (
    <div className="input-wrapper">
      <input
        ref={ref}
        className="input"
        type="search"
        placeholder={placeholder}
        onChange={handleOnChange}
        autoComplete="off"
        value={searchValue}
        {...controlProps}
      />
      <div className="icon">
        <Icon {...props} onFocus={onFocus} />
      </div>
    </div>
  )
}