"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = Icon;
var _components = require("@wordpress/components");
var _icons = require("@wordpress/icons");
function Icon(props) {
  var isLoading = props.isLoading,
    searchValue = props.searchValue,
    setSearchValue = props.setSearchValue,
    onClear = props.onClear,
    clearText = props.clearText,
    onFocus = props.onFocus;
  if (isLoading) {
    return /*#__PURE__*/React.createElement(_components.Spinner, null);
  }
  var handleClick = function handleClick() {
    setSearchValue('');
    onFocus();
    onClear();
  };
  if (searchValue.length > 0) {
    return /*#__PURE__*/React.createElement(_components.Button, {
      icon: _icons.closeSmall,
      label: clearText,
      onClick: handleClick
    });
  }
  return /*#__PURE__*/React.createElement(_icons.Icon, {
    icon: _icons.search
  });
}