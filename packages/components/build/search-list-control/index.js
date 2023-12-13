"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _element = require("@wordpress/element");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _components = require("@wordpress/components");
var _compose = require("@wordpress/compose");
var _input = require("./input");
var _results = require("./results");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * External dependencies
 */ /**
 * Internal dependencies
 */
function SearchListControl(props) {
  var id = props.id;
  var idProps = (0, _compose.useInstanceId)(SearchListControl, 'search-list-control', id);
  var _useBaseControlProps = (0, _components.useBaseControlProps)(_objectSpread(_objectSpread({}, props), {}, {
      id: idProps
    })),
    baseControlProps = _useBaseControlProps.baseControlProps,
    controlProps = _useBaseControlProps.controlProps;
  var _useState = (0, _element.useState)(''),
    _useState2 = _slicedToArray(_useState, 2),
    searchValue = _useState2[0],
    setSearchValue = _useState2[1];
  return /*#__PURE__*/React.createElement(_components.BaseControl, baseControlProps, /*#__PURE__*/React.createElement("div", {
    className: "storepress-component-search-list"
  }, /*#__PURE__*/React.createElement(_input.Input, _extends({
    searchValue: searchValue,
    setSearchValue: setSearchValue,
    controlProps: controlProps
  }, baseControlProps)), /*#__PURE__*/React.createElement(_results.Results, _extends({
    searchValue: searchValue
  }, baseControlProps))));
}
SearchListControl.defaultProps = {
  items: [],
  selected: [],
  disableFilter: false,
  isLoading: false,
  isMultiSelect: false,
  hideSearchBox: false,
  placeholder: '',
  clearText: '',
  noItemsFoundText: '',
  itemKeyName: 'id',
  itemValueName: ['name'],
  itemMetaName: [],
  itemFilterName: ['name'],
  onSearch: function onSearch(searchString) {},
  onSelect: function onSelect(selectedKeys, selectedItems) {},
  onClear: function onClear() {}
};
// @TODO: Add itemMetaNameSeparator, itemValueNameSeparator
SearchListControl.propTypes = {
  id: _propTypes["default"].string,
  label: _propTypes["default"].string,
  help: _propTypes["default"].string,
  hideLabelFromVision: _propTypes["default"].bool,
  className: _propTypes["default"].string,
  items: _propTypes["default"].array.isRequired,
  selected: _propTypes["default"].array,
  disableFilter: _propTypes["default"].bool,
  itemKeyName: _propTypes["default"].string,
  itemValueName: _propTypes["default"].array,
  itemMetaName: _propTypes["default"].array,
  itemFilterName: _propTypes["default"].array,
  placeholder: _propTypes["default"].string,
  noItemsFoundText: _propTypes["default"].string,
  isLoading: _propTypes["default"].bool,
  hideSearchBox: _propTypes["default"].bool,
  isMultiSelect: _propTypes["default"].bool,
  onSearch: _propTypes["default"].func,
  onSelect: _propTypes["default"].func,
  onClear: _propTypes["default"].func
};
var _default = exports["default"] = SearchListControl;