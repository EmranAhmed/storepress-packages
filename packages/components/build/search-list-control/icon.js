"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = Icon;
var _components = require("@wordpress/components");
var _icons = require("@wordpress/icons");
function Icon(props) {
  const {
    isLoading,
    searchValue,
    setSearchValue,
    clearText = '',
    onClear = () => {},
    onFocus = () => {}
  } = props;
  if (isLoading) {
    return /*#__PURE__*/React.createElement(_components.Spinner, null);
  }
  const handleClick = () => {
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