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
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
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