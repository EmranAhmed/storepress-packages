"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Input = Input;
var _element = require("@wordpress/element");
var _icon = require("./icon");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input(props) {
  const {
    controlProps,
    searchValue,
    setSearchValue,
    placeholder,
    onSearch
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
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    className: "input",
    type: "search",
    placeholder: placeholder,
    onChange: handleOnChange,
    autoComplete: "off",
    value: searchValue
  }, controlProps)), /*#__PURE__*/React.createElement("div", {
    className: "icon"
  }, /*#__PURE__*/React.createElement(_icon.Icon, _extends({}, props, {
    onFocus: onFocus
  }))));
}