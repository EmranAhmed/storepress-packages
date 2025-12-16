"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Results = Results;
var _element = require("@wordpress/element");
var _utils = require("@storepress/utils");
function Results(props) {
  const {
    id,
    disableFilter,
    isLoading,
    searchValue,
    items,
    itemKeyName,
    itemFilterName,
    isMultiSelect,
    itemValueName,
    itemValueNameSeparator,
    itemMetaName,
    itemMetaNameSeparator,
    selected,
    onSelect,
    noItemsFoundText
  } = props;
  const [selectedItemKeys, setSelectedItemKeys] = (0, _element.useState)(selected || []);
  const inputName = `${id}-result-item`;
  const handleMultiSelection = (currentId, isSelected) => {
    if (isSelected) {
      setSelectedItemKeys(values => {
        values.push(currentId);
        return [...new Set(values)];
      });
    } else {
      setSelectedItemKeys(values => values.filter(value => value !== currentId));
    }
  };
  const handleSingleSelection = (currentId, isSelected) => {
    if (isSelected) {
      setSelectedItemKeys([currentId]);
    } else {
      setSelectedItemKeys([]);
    }
  };
  const handleSelected = event => {
    const {
      value,
      checked
    } = event?.target;
    if (isMultiSelect) {
      handleMultiSelection(value, checked);
    } else {
      handleSingleSelection(value, checked);
    }
  };
  const handleChecked = (selectedItems, currentItem) => {
    return selectedItems.includes(currentItem) || selectedItems.includes(currentItem?.toString());
  };
  const currentItems = (0, _element.useMemo)(() => {
    if (disableFilter) {
      return items;
    }
    if (searchValue.length > 0) {
      const re = new RegExp((0, _utils.escapeRegex)(searchValue), 'i');
      return items.map(item => {
        const text = itemFilterName?.reduce((str, filterKey) => {
          const innerText = (0, _utils.findObjectValue)(item, filterKey);
          str.push(innerText);
          return str;
        }, []).join(' ');
        return re.test(text) ? item : false;
      }).filter(Boolean);
    }
    return items;
  }, [searchValue, items, disableFilter]);
  const selectedItems = (0, _element.useMemo)(() => {
    return items.map(item => {
      const key = (0, _utils.findObjectValue)(item, itemKeyName);
      return selectedItemKeys.includes(key) || selectedItemKeys.includes(key?.toString()) ? item : false;
    }).filter(Boolean);
  }, [selectedItemKeys, currentItems]);
  (0, _element.useLayoutEffect)(() => {
    onSelect(selectedItemKeys, selectedItems);
  }, [selectedItemKeys, selectedItems]);
  if (isLoading) {
    return /*#__PURE__*/React.createElement(React.Fragment, null);
  }
  return currentItems.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "results-wrapper"
  }, /*#__PURE__*/React.createElement("ul", null, currentItems.map((item, index) => {
    const key = (0, _utils.findObjectValue)(item, itemKeyName);
    // const value = findObjectValue(item, itemValueName);

    const meta = itemMetaName?.reduce((metas, currentMeta) => {
      const m = (0, _utils.findObjectValue)(item, currentMeta);
      metas.push(m);
      return metas;
    }, []).join(itemMetaNameSeparator);
    const value = itemValueName?.reduce((values, currentValue) => {
      const m = (0, _utils.findObjectValue)(item, currentValue);
      values.push(m);
      return values;
    }, []).join(itemValueNameSeparator);
    const listId = `${inputName}-${index}`;
    return /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "result-item"
    }, /*#__PURE__*/React.createElement("input", {
      checked: handleChecked(selectedItemKeys, key),
      onChange: handleSelected,
      id: listId,
      name: inputName,
      value: key,
      type: isMultiSelect ? 'checkbox' : 'radio'
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: listId,
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