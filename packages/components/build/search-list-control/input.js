"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Input = Input;
var _element = require("@wordpress/element");
var _icon = require("./icon");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input(props) {
  var controlProps = props.controlProps,
    searchValue = props.searchValue,
    setSearchValue = props.setSearchValue,
    placeholder = props.placeholder,
    hideSearchBox = props.hideSearchBox,
    onSearch = props.onSearch;
  if (hideSearchBox) {
    return;
  }
  var ref = (0, _element.useRef)();
  var handleOnChange = (0, _element.useCallback)(function (event) {
    var _event$target = event === null || event === void 0 ? void 0 : event.target,
      value = _event$target.value;
    setSearchValue(value);
  }, []);
  var onFocus = function onFocus() {
    var _ref$current;
    (_ref$current = ref.current) === null || _ref$current === void 0 || _ref$current.focus();
  };
  (0, _element.useLayoutEffect)(function () {
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