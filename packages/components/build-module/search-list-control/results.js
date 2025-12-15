import { useLayoutEffect, useMemo, useState } from '@wordpress/element';
import { escapeRegex, findObjectValue } from '@storepress/utils';
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Results(props) {
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
    itemMetaName,
    selected,
    onSelect,
    noItemsFoundText
  } = props;
  const [selectedItemKeys, setSelectedItemKeys] = useState(selected || []);
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
  const currentItems = useMemo(() => {
    if (disableFilter) {
      return items;
    }
    if (searchValue.length > 0) {
      const re = new RegExp(escapeRegex(searchValue), 'i');
      return items.map(item => {
        const text = itemFilterName?.reduce((str, filterKey) => {
          const text = findObjectValue(item, filterKey);
          str.push(text);
          return str;
        }, []).join(' ');
        return re.test(text) ? item : false;
      }).filter(Boolean);
    }
    return items;
  }, [searchValue, items, disableFilter]);
  const selectedItems = useMemo(() => {
    return items.map(item => {
      const key = findObjectValue(item, itemKeyName);
      return selectedItemKeys.includes(key) || selectedItemKeys.includes(key?.toString()) ? item : false;
    }).filter(Boolean);
  }, [selectedItemKeys, currentItems]);
  useLayoutEffect(() => {
    onSelect(selectedItemKeys, selectedItems);
  }, [selectedItemKeys, selectedItems]);
  if (isLoading) {
    return /*#__PURE__*/_jsx(_Fragment, {});
  }
  return currentItems.length > 0 ? /*#__PURE__*/_jsx("div", {
    className: "results-wrapper",
    children: /*#__PURE__*/_jsx("ul", {
      children: currentItems.map((item, index) => {
        const key = findObjectValue(item, itemKeyName);
        // const value = findObjectValue(item, itemValueName);

        const meta = itemMetaName?.reduce((metas, currentMeta) => {
          const m = findObjectValue(item, currentMeta);
          metas.push(m);
          return metas;
        }, []).join(', ');
        const value = itemValueName?.reduce((values, currentValue) => {
          const m = findObjectValue(item, currentValue);
          values.push(m);
          return values;
        }, []).join(' - ');
        const id = `${inputName}-${index}`;
        return /*#__PURE__*/_jsxs("li", {
          className: "result-item",
          children: [/*#__PURE__*/_jsx("input", {
            checked: handleChecked(selectedItemKeys, key),
            onChange: handleSelected,
            id: id,
            name: inputName,
            value: key,
            type: isMultiSelect ? 'checkbox' : 'radio'
          }), /*#__PURE__*/_jsx("label", {
            htmlFor: id,
            className: "result-item__label",
            children: /*#__PURE__*/_jsx("span", {
              className: "result-item__title",
              children: value
            })
          }), meta && /*#__PURE__*/_jsx("small", {
            className: "result-item__meta",
            children: meta
          })]
        }, index);
      })
    })
  }) : /*#__PURE__*/_jsx("div", {
    className: "results-wrapper error not-found",
    children: noItemsFoundText
  });
}