import { useCallback, useLayoutEffect, useRef } from "@wordpress/element";
import { Icon } from "./icon";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Input(props) {
  const {
    controlProps,
    searchValue,
    setSearchValue,
    placeholder,
    hideSearchBox,
    onSearch
  } = props;
  if (hideSearchBox) {
    return;
  }
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
      ref: ref,
      className: "input",
      type: "search",
      placeholder: placeholder,
      onChange: handleOnChange,
      autoComplete: "off",
      value: searchValue,
      ...controlProps
    }), /*#__PURE__*/_jsx("div", {
      className: "icon",
      children: /*#__PURE__*/_jsx(Icon, {
        ...props,
        onFocus: onFocus
      })
    })]
  });
}