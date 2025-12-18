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
    // base component
    label = '',
    className = '',
    hideLabelFromVision = false,
    help = '',
    // component
    placeholder = '',
    clearText = '',
    isLoading = false,
    hideSearchBox = false,
    isMultiSelect = false,
    items = [],
    itemKeyName = 'id',
    itemValueName = ['name'],
    itemMetaName = [],
    itemFilterName = ['name'],
    selected = [],
    itemValueNameSeparator = ' - ',
    itemMetaNameSeparator = ', ',
    noItemsFoundText = '',
    // callbacks
    onSearch = () => {},
    onSelect = () => {},
    onClear = () => {}
  } = props;
  const id = (0, _compose.useInstanceId)(SearchListControl, 'storepress-search-list-control');
  const {
    baseControlProps
  } = (0, _components.useBaseControlProps)({
    label,
    className,
    hideLabelFromVision,
    id,
    help
  });
  const [searchValue, setSearchValue] = (0, _element.useState)('');
  return /*#__PURE__*/React.createElement(_components.BaseControl, _extends({}, baseControlProps, {
    __nextHasNoMarginBottom: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "storepress-component-search-list-control"
  }, !hideSearchBox && /*#__PURE__*/React.createElement(_input.Input, {
    id: id,
    isLoading: isLoading,
    searchValue: searchValue,
    placeholder: placeholder,
    clearText: clearText,
    setSearchValue: setSearchValue,
    onClear: onClear,
    onSearch: onSearch
  }), /*#__PURE__*/React.createElement(_results.Results, {
    id: id,
    isLoading: isLoading,
    isMultiSelect: isMultiSelect,
    items: items,
    itemKeyName: itemKeyName,
    itemValueName: itemValueName,
    itemMetaName: itemMetaName,
    itemFilterName: itemFilterName,
    selected: selected,
    onSelect: onSelect,
    itemValueNameSeparator: itemValueNameSeparator,
    itemMetaNameSeparator: itemMetaNameSeparator,
    searchValue: searchValue,
    noItemsFoundText: noItemsFoundText
  })));
}
SearchListControl.propTypes = {
  label: _propTypes.default.string,
  className: _propTypes.default.string,
  hideLabelFromVision: _propTypes.default.bool,
  help: _propTypes.default.string,
  items: _propTypes.default.array.isRequired,
  selected: _propTypes.default.array,
  itemKeyName: _propTypes.default.string,
  itemValueName: _propTypes.default.array,
  itemValueNameSeparator: _propTypes.default.string,
  itemMetaName: _propTypes.default.array,
  itemMetaNameSeparator: _propTypes.default.string,
  itemFilterName: _propTypes.default.array,
  placeholder: _propTypes.default.string,
  noItemsFoundText: _propTypes.default.string,
  clearText: _propTypes.default.string,
  isLoading: _propTypes.default.bool,
  hideSearchBox: _propTypes.default.bool,
  isMultiSelect: _propTypes.default.bool,
  onSearch: _propTypes.default.func,
  onSelect: _propTypes.default.func,
  onClear: _propTypes.default.func
};
var _default = exports.default = SearchListControl;