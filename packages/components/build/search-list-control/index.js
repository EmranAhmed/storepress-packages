"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _element = require("@wordpress/element");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _components = require("@wordpress/components");
var _compose = require("@wordpress/compose");
var _input = require("./input");
var _results = require("./results");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 * External dependencies
 */ /**
 * Internal dependencies
 */
function SearchListControl(props) {
  const {
    id,
    hideSearchBox = false,
    itemValueNameSeparator = ' _ ',
    itemMetaNameSeparator = ', '
  } = props;
  const idProps = (0, _compose.useInstanceId)(SearchListControl, 'search-list-control', id);
  const {
    baseControlProps,
    controlProps
  } = (0, _components.useBaseControlProps)({
    ...props,
    id: idProps
  });
  const [searchValue, setSearchValue] = (0, _element.useState)('');
  console.log(props);
  return;
  return /*#__PURE__*/React.createElement(_components.BaseControl, _extends({}, baseControlProps, {
    __nextHasNoMarginBottom: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "storepress-component-search-list"
  }, !hideSearchBox && /*#__PURE__*/React.createElement(_input.Input, _extends({
    searchValue: searchValue,
    setSearchValue: setSearchValue,
    controlProps: controlProps
  }, baseControlProps)), /*#__PURE__*/React.createElement(_results.Results, _extends({
    itemValueNameSeparator: itemValueNameSeparator,
    itemMetaNameSeparator: itemMetaNameSeparator,
    searchValue: searchValue
  }, baseControlProps))));
}

// @TODO: Add itemMetaNameSeparator, itemValueNameSeparator
SearchListControl.propTypes = {
  id: _propTypes.default.string,
  label: _propTypes.default.string,
  help: _propTypes.default.string,
  hideLabelFromVision: _propTypes.default.bool,
  className: _propTypes.default.string,
  items: _propTypes.default.array.isRequired,
  selected: _propTypes.default.array,
  disableFilter: _propTypes.default.bool,
  itemKeyName: _propTypes.default.string,
  itemValueName: _propTypes.default.array,
  itemValueNameSeparator: _propTypes.default.string,
  itemMetaName: _propTypes.default.array,
  itemMetaNameSeparator: _propTypes.default.string,
  itemFilterName: _propTypes.default.array,
  placeholder: _propTypes.default.string,
  noItemsFoundText: _propTypes.default.string,
  isLoading: _propTypes.default.bool,
  hideSearchBox: _propTypes.default.bool,
  isMultiSelect: _propTypes.default.bool,
  onSearch: _propTypes.default.func,
  onSelect: _propTypes.default.func,
  onClear: _propTypes.default.func
};
var _default = exports.default = SearchListControl;