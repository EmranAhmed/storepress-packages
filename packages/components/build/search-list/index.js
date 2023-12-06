"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchList = SearchList;
var _components = require("@wordpress/components");
var _element = require("@wordpress/element");
var _icons = require("@wordpress/icons");
var _classnames = _interopRequireDefault(require("classnames"));
var _compose = require("@wordpress/compose");
var _excluded = ["className", "onChange", "onKeyDown", "value", "label", "isLoading", "placeholder", "closeText", "resetText", "hideLabelFromVision", "help", "onClear"];
/**
 * External dependencies
 */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function findObjectValue(obj, path, defValue) {
  // If path is not defined or it has false value
  if (!path) return undefined;
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  var pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  var result = pathArray.reduce(function (prevObj, key) {
    return prevObj && prevObj[key];
  }, obj);
  // If found value is undefined return default value; otherwise return the value
  return result === undefined ? defValue : result;
}
function SearchControl(_ref) {
  var className = _ref.className,
    _onChange = _ref.onChange,
    onKeyDown = _ref.onKeyDown,
    value = _ref.value,
    label = _ref.label,
    _ref$isLoading = _ref.isLoading,
    isLoading = _ref$isLoading === void 0 ? false : _ref$isLoading,
    _ref$placeholder = _ref.placeholder,
    placeholder = _ref$placeholder === void 0 ? '' : _ref$placeholder,
    _ref$closeText = _ref.closeText,
    closeText = _ref$closeText === void 0 ? '' : _ref$closeText,
    _ref$resetText = _ref.resetText,
    resetText = _ref$resetText === void 0 ? '' : _ref$resetText,
    _ref$hideLabelFromVis = _ref.hideLabelFromVision,
    hideLabelFromVision = _ref$hideLabelFromVis === void 0 ? true : _ref$hideLabelFromVis,
    help = _ref.help,
    onClear = _ref.onClear,
    restProps = _objectWithoutProperties(_ref, _excluded);
  var searchRef = (0, _element.useRef)();
  var instanceId = (0, _compose.useInstanceId)(SearchControl);
  var id = "storepress-components-search-control-".concat(instanceId);
  var renderRightButton = function renderRightButton() {
    if (isLoading) {
      return /*#__PURE__*/React.createElement(_components.Spinner, null);
    }
    if (onClear) {
      return /*#__PURE__*/React.createElement(_components.Button, {
        icon: _icons.closeSmall,
        label: closeText,
        onClick: function onClick() {
          var _searchRef$current;
          onClear();
          _onChange('');
          (_searchRef$current = searchRef.current) === null || _searchRef$current === void 0 || _searchRef$current.focus();
        }
      });
    }
    if (!!value) {
      return /*#__PURE__*/React.createElement(_components.Button, {
        icon: _icons.closeSmall,
        label: resetText,
        onClick: function onClick() {
          var _searchRef$current2;
          _onChange('');
          (_searchRef$current2 = searchRef.current) === null || _searchRef$current2 === void 0 || _searchRef$current2.focus();
        }
      });
    }
    return /*#__PURE__*/React.createElement(_icons.Icon, {
      icon: _icons.search
    });
  };
  return /*#__PURE__*/React.createElement(_components.BaseControl, {
    label: label,
    id: id,
    __nextHasNoMarginBottom: true,
    hideLabelFromVision: hideLabelFromVision,
    help: help,
    className: (0, _classnames["default"])(className, 'storepress-components-search-control')
  }, /*#__PURE__*/React.createElement("div", {
    className: "storepress-components-search-control__input-wrapper"
  }, /*#__PURE__*/React.createElement("input", _extends({}, restProps, {
    ref: searchRef,
    className: "storepress-components-search-control__input",
    id: id,
    type: "search",
    placeholder: placeholder,
    onChange: function onChange(event) {
      return _onChange(event.target.value);
    },
    onKeyDown: onKeyDown,
    autoComplete: "off",
    value: value || ''
  })), /*#__PURE__*/React.createElement("div", {
    className: "storepress-components-search-control__icon"
  }, renderRightButton())));
}
function SearchResults(_ref2) {
  var useKey = _ref2.useKey,
    useValue = _ref2.useValue,
    useMeta = _ref2.useMeta,
    selected = _ref2.selected,
    suggestions = _ref2.suggestions,
    isMultiSelect = _ref2.isMultiSelect,
    onSelect = _ref2.onSelect;
  var instanceId = (0, _compose.useInstanceId)(SearchResults);
  var inputName = "storepress-components-search-result-item-".concat(instanceId);
  var _useState = (0, _element.useState)(selected),
    _useState2 = _slicedToArray(_useState, 2),
    selectedItem = _useState2[0],
    setSelectedItem = _useState2[1];
  var handleMultiSelection = function handleMultiSelection(currentId, isSelected) {
    if (isSelected) {
      setSelectedItem(function (values) {
        values.push(currentId);
        return _toConsumableArray(new Set(values));
      });
    } else {
      setSelectedItem(function (values) {
        return values.filter(function (value) {
          return value !== currentId;
        });
      });
    }
  };
  var handleSingleSelection = function handleSingleSelection(currentId, isSelected) {
    if (isSelected) {
      setSelectedItem([currentId]);
    } else {
      setSelectedItem([]);
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
  (0, _element.useLayoutEffect)(function () {
    onSelect(selectedItem);
  }, [selectedItem]);
  return suggestions.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "storepress-search-list-search-result-wrapper"
  }, /*#__PURE__*/React.createElement("ul", null, suggestions.map(function (suggestion, index) {
    var key = findObjectValue(suggestion, useKey);
    var value = findObjectValue(suggestion, useValue);
    var meta = findObjectValue(suggestion, useMeta);
    var inputId = "storepress-components-search-result-id-".concat(instanceId, "-").concat(index);
    return /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "storepress-search-list-search-result-item"
    }, /*#__PURE__*/React.createElement("input", {
      checked: handleChecked(selected, key),
      onChange: handleSelected,
      id: inputId,
      name: inputName,
      value: key,
      type: isMultiSelect ? 'checkbox' : 'radio'
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: inputId,
      className: "storepress-search-list-search-result-item__label"
    }, /*#__PURE__*/React.createElement("span", {
      className: "storepress-search-list-search-result-item__title"
    }, value)), meta && /*#__PURE__*/React.createElement("small", {
      className: "storepress-search-list-search-result-item__meta"
    }, meta));
  }))) : '';
}
function SearchList(_ref3) {
  var _ref3$selected = _ref3.selected,
    selected = _ref3$selected === void 0 ? [] : _ref3$selected,
    _ref3$suggestions = _ref3.suggestions,
    suggestions = _ref3$suggestions === void 0 ? [] : _ref3$suggestions,
    _ref3$isLoading = _ref3.isLoading,
    isLoading = _ref3$isLoading === void 0 ? false : _ref3$isLoading,
    _ref3$isMultiSelect = _ref3.isMultiSelect,
    isMultiSelect = _ref3$isMultiSelect === void 0 ? false : _ref3$isMultiSelect,
    _ref3$hideSearchBox = _ref3.hideSearchBox,
    hideSearchBox = _ref3$hideSearchBox === void 0 ? false : _ref3$hideSearchBox,
    _ref3$keyName = _ref3.keyName,
    keyName = _ref3$keyName === void 0 ? 'id' : _ref3$keyName,
    _ref3$valueName = _ref3.valueName,
    valueName = _ref3$valueName === void 0 ? 'name' : _ref3$valueName,
    _ref3$metaName = _ref3.metaName,
    metaName = _ref3$metaName === void 0 ? '' : _ref3$metaName,
    _ref3$onSearch = _ref3.onSearch,
    onSearch = _ref3$onSearch === void 0 ? function (input) {} : _ref3$onSearch,
    _ref3$onSelect = _ref3.onSelect,
    onSelect = _ref3$onSelect === void 0 ? function (input) {} : _ref3$onSelect,
    _ref3$placeholder = _ref3.placeholder,
    placeholder = _ref3$placeholder === void 0 ? '' : _ref3$placeholder,
    _ref3$help = _ref3.help,
    help = _ref3$help === void 0 ? '' : _ref3$help;
  var _useState3 = (0, _element.useState)(''),
    _useState4 = _slicedToArray(_useState3, 2),
    currentValue = _useState4[0],
    setCurrentValue = _useState4[1];
  var onStartTyping = function onStartTyping(input) {
    setCurrentValue(input);
    onSearch(input);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "storepress-search-list-wrapper"
  }, !hideSearchBox && /*#__PURE__*/React.createElement("div", {
    className: "storepress-search-list-search-control-wrapper"
  }, /*#__PURE__*/React.createElement(SearchControl, {
    isLoading: isLoading,
    onChange: onStartTyping,
    value: currentValue,
    placeholder: placeholder,
    help: help
  })), /*#__PURE__*/React.createElement(SearchResults, {
    useKey: keyName,
    useValue: valueName,
    useMeta: metaName,
    selected: selected,
    suggestions: suggestions,
    onSelect: onSelect,
    isMultiSelect: isMultiSelect
  }));
}