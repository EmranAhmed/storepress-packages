import { useCallback, useLayoutEffect, useRef } from '@wordpress/element';
import { Icon } from './icon';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Input(props) {
  const {
    id,
    isLoading,
    searchValue,
    placeholder,
    clearText,
    setSearchValue,
    onSearch,
    onClear
  } = props;
  const ref = useRef();
  const handleOnChange = useCallback(event => {
    const {
      value
    } = event?.target;
    setSearchValue(value);
  }, []);
  const onFocus = () => {
    ref.current?.focus();
  };
  useLayoutEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);
  return /*#__PURE__*/_jsxs("div", {
    className: "input-wrapper",
    children: [/*#__PURE__*/_jsx("input", {
      id: id,
      ref: ref,
      className: "input",
      type: "search",
      placeholder: placeholder,
      onChange: handleOnChange,
      autoComplete: "off",
      value: searchValue
    }), /*#__PURE__*/_jsx("div", {
      className: "icon",
      children: /*#__PURE__*/_jsx(Icon, {
        isLoading: isLoading,
        searchValue: searchValue,
        setSearchValue: setSearchValue,
        onClear: onClear,
        clearText: clearText,
        onFocus: onFocus
      })
    })]
  });
}