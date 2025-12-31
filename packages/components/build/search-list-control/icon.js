"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = Icon;
var _components = require("@wordpress/components");
var _icons = require("@wordpress/icons");
var _common = require("../common");
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Search input icon component that displays different states based on loading and search value.
 *
 * Renders a spinner when loading, a clear button when search has value, or a search icon when empty.
 *
 * @param {Object}   props                   - Component props.
 * @param {boolean}  [props.isLoading=false] - Whether the search is in a loading state.
 * @param {string}   [props.search='']       - Current search input value.
 * @param {string}   [props.clearText='']    - Accessible label for the clear button.
 * @param {Function} [props.onClear]         - Callback fired when the clear button is clicked.
 * @param {Function} [props.onFocus]         - Callback fired when the clear button is clicked, typically to refocus the input.
 * @return {JSX.Element} Spinner, clear button, or search icon based on current state.
 */
function Icon(props) {
  const {
    isLoading = false,
    search = '',
    clearText = '',
    onClear = _common.noop,
    onFocus = _common.noop
  } = props;
  const handleClick = event => {
    onFocus(event);
    onClear(event);
  };
  if (isLoading) {
    return /*#__PURE__*/React.createElement(_components.Spinner, null);
  }
  if (search) {
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