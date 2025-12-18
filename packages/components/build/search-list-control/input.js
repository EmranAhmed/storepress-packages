"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Input = Input;
var _element = require("@wordpress/element");
var _icon = require("./icon");
function Input(props) {
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
  const ref = (0, _element.useRef)();
  const handleOnChange = (0, _element.useCallback)(event => {
    const {
      value
    } = event?.target;
    setSearchValue(value);
  }, []);
  const onFocus = () => {
    ref.current?.focus();
  };
  (0, _element.useLayoutEffect)(() => {
    onSearch(searchValue);
  }, [searchValue]);
  return /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    ref: ref,
    className: "input",
    type: "search",
    placeholder: placeholder,
    onChange: handleOnChange,
    autoComplete: "off",
    value: searchValue
  }), /*#__PURE__*/React.createElement("div", {
    className: "icon"
  }, /*#__PURE__*/React.createElement(_icon.Icon, {
    isLoading: isLoading,
    searchValue: searchValue,
    setSearchValue: setSearchValue,
    onClear: onClear,
    clearText: clearText,
    onFocus: onFocus
  })));
}