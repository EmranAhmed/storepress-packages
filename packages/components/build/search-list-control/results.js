"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Results = Results;
var _element = require("@wordpress/element");
var _utils = require("./utils");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function Results(props) {
  var id = props.id,
    disableFilter = props.disableFilter,
    searchValue = props.searchValue,
    items = props.items,
    itemKeyName = props.itemKeyName,
    itemFilterName = props.itemFilterName,
    isMultiSelect = props.isMultiSelect,
    itemValueName = props.itemValueName,
    itemMetaName = props.itemMetaName,
    selected = props.selected,
    onSelect = props.onSelect,
    noItemsFoundText = props.noItemsFoundText;
  var _useState = (0, _element.useState)(selected || []),
    _useState2 = _slicedToArray(_useState, 2),
    selectedItemKeys = _useState2[0],
    setSelectedItemKeys = _useState2[1];
  var inputName = "".concat(id, "-result-item");
  var handleMultiSelection = function handleMultiSelection(currentId, isSelected) {
    if (isSelected) {
      setSelectedItemKeys(function (values) {
        values.push(currentId);
        return _toConsumableArray(new Set(values));
      });
    } else {
      setSelectedItemKeys(function (values) {
        return values.filter(function (value) {
          return value !== currentId;
        });
      });
    }
  };
  var handleSingleSelection = function handleSingleSelection(currentId, isSelected) {
    if (isSelected) {
      setSelectedItemKeys([currentId]);
    } else {
      setSelectedItemKeys([]);
    }
  };
  var handleSelected = function handleSelected(event) {
    var _event$target = event === null || event === void 0 ? void 0 : event.target,
      value = _event$target.value,
      checked = _event$target.checked;
    if (isMultiSelect) {
      handleMultiSelection(value, checked);
    } else {
      handleSingleSelection(value, checked);
    }
  };
  var handleChecked = function handleChecked(selectedItems, currentItem) {
    return selectedItems.includes(currentItem) || selectedItems.includes(currentItem === null || currentItem === void 0 ? void 0 : currentItem.toString());
  };
  var currentItems = (0, _element.useMemo)(function () {
    if (disableFilter) {
      return items;
    }
    if (searchValue.length > 0) {
      var re = new RegExp((0, _utils.escapeRegex)(searchValue), 'i');
      return items.map(function (item) {
        var text = itemFilterName.reduce(function (str, filterKey) {
          var text = (0, _utils.findObjectValue)(item, filterKey);
          str.push(text);
          return str;
        }, []).join(' ');
        return re.test(text) ? item : false;
      }).filter(Boolean);
    }
    return items;
  }, [searchValue, items, disableFilter]);
  var selectedItems = (0, _element.useMemo)(function () {
    return items.map(function (item) {
      var key = (0, _utils.findObjectValue)(item, itemKeyName);
      return selectedItemKeys.includes(key) || selectedItemKeys.includes(key === null || key === void 0 ? void 0 : key.toString()) ? item : false;
    }).filter(Boolean);
  }, [selectedItemKeys, currentItems]);
  (0, _element.useLayoutEffect)(function () {
    onSelect(selectedItemKeys, selectedItems);
  }, [selectedItemKeys, selectedItems]);
  return currentItems.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "results-wrapper"
  }, /*#__PURE__*/React.createElement("ul", null, currentItems.map(function (item, index) {
    var key = (0, _utils.findObjectValue)(item, itemKeyName);
    // const value = findObjectValue(item, itemValueName);

    var meta = itemMetaName.reduce(function (metas, currentMeta) {
      var m = (0, _utils.findObjectValue)(item, currentMeta);
      metas.push(m);
      return metas;
    }, []).join(', ');
    var value = itemValueName.reduce(function (values, currentValue) {
      var m = (0, _utils.findObjectValue)(item, currentValue);
      values.push(m);
      return values;
    }, []).join(' - ');
    var id = "".concat(inputName, "-").concat(index);
    return /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "result-item"
    }, /*#__PURE__*/React.createElement("input", {
      checked: handleChecked(selectedItemKeys, key),
      onChange: handleSelected,
      id: id,
      name: inputName,
      value: key,
      type: isMultiSelect ? 'checkbox' : 'radio'
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: id,
      className: "result-item__label"
    }, /*#__PURE__*/React.createElement("span", {
      className: "result-item__title"
    }, value)), meta && /*#__PURE__*/React.createElement("small", {
      className: "result-item__meta"
    }, meta));
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "results-wrapper error not-found"
  }, noItemsFoundText);
}