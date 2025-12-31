"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Results = Results;
var _element = require("@wordpress/element");
var _utils = require("@storepress/utils");
var _common = require("../common");
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Search results list component that displays filterable items with selection support.
 *
 * Renders a list of selectable items (radio buttons or checkboxes) with support for
 * client-side filtering, custom display values, and metadata. Shows a "not found"
 * message when no items match the search criteria.
 *
 * @param {Object}        props                          - Component props.
 * @param {string}        props.id                       - Base ID used for generating input names and list item IDs.
 * @param {boolean}       [props.isLoading]              - Whether the results are in a loading state. Returns empty fragment when true.
 * @param {string}        props.search                   - Current search query used for filtering items.
 * @param {Array<Object>} props.items                    - Array of item objects to display.
 * @param {string}        props.itemKeyName              - Object key path to use as the unique identifier/value for each item.
 * @param {string[]}      [props.itemFilterName]         - Array of object key paths to search against when filtering.
 * @param {boolean}       [props.isMultiSelect]          - Whether multiple items can be selected. Uses checkboxes if true, radio buttons if false.
 * @param {boolean}       [props.disableItemFilter]      - Whether to disable client-side filtering of items.
 * @param {string[]}      [props.itemValueName]          - Array of object key paths to use for the display label.
 * @param {string}        [props.itemValueNameSeparator] - Separator string when joining multiple value fields.
 * @param {string[]}      [props.itemMetaName]           - Array of object key paths to use for the metadata display.
 * @param {string}        [props.itemMetaNameSeparator]  - Separator string when joining multiple meta fields.
 * @param {Array}         [props.selected=[]]            - Array of currently selected item keys.
 * @param {Function}      [props.onSelect]               - Callback fired when an item is selected/deselected. Receives the change event.
 * @param {string}        [props.noItemsFoundText]       - Text to display when no items match the search criteria.
 * @return {JSX.Element} The results list, empty fragment when loading, or not found message.
 *
 * @example
 * // Single select with basic items
 * <Results
 *     id="fruit-select"
 *     search={ searchText }
 *     items={ [
 *         { id: 'apple', name: 'Apple', price: '$1.00' },
 *         { id: 'banana', name: 'Banana', price: '$0.50' },
 *     ] }
 *     itemKeyName="id"
 *     itemValueName={ [ 'name' ] }
 *     itemMetaName={ [ 'price' ] }
 *     itemFilterName={ [ 'name' ] }
 *     selected={ [ 'apple' ] }
 *     onSelect={ handleSelect }
 *     noItemsFoundText="No fruits found."
 * />
 *
 * @example
 * // Multi-select with nested object values
 * <Results
 *     id="user-select"
 *     search={ searchText }
 *     items={ users }
 *     itemKeyName="user.id"
 *     itemValueName={ [ 'user.firstName', 'user.lastName' ] }
 *     itemValueNameSeparator=" "
 *     itemFilterName={ [ 'user.firstName', 'user.lastName', 'user.email' ] }
 *     isMultiSelect={ true }
 *     selected={ selectedUserIds }
 *     onSelect={ handleUserSelect }
 *     noItemsFoundText="No users match your search."
 * />
 */
function Results(props) {
  const {
    id,
    isLoading,
    search,
    items,
    itemKeyName,
    itemFilterName,
    isMultiSelect,
    disableItemFilter,
    itemValueName,
    itemValueNameSeparator,
    itemMetaName,
    itemMetaNameSeparator,
    selected = [],
    onSelect = _common.noop,
    noItemsFoundText
  } = props;
  const inputName = `${id}-result-item`;
  const isChecked = (selectedItems, currentItem) => {
    return selectedItems.includes(currentItem) || selectedItems.includes(currentItem?.toString());
  };
  const availableItems = (0, _element.useMemo)(() => {
    if (search.length > 0 && !disableItemFilter) {
      const re = new RegExp((0, _utils.escapeRegex)(search), 'i');
      return items.map(item => {
        const text = itemFilterName?.reduce((str, filterKey) => {
          const innerText = (0, _utils.findObjectValue)(item, filterKey, '');
          str.push(innerText);
          return str;
        }, []).join(' ');
        return re.test(text) ? item : false;
      }).filter(Boolean);
    }
    return items;
  }, [search, disableItemFilter, items, itemFilterName]);
  if (isLoading) {
    return /*#__PURE__*/React.createElement(React.Fragment, null);
  }
  return availableItems.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "results-wrapper"
  }, /*#__PURE__*/React.createElement("ul", null, availableItems.map((item, index) => {
    const meta = itemMetaName?.reduce((metas, currentMeta) => {
      const m = (0, _utils.findObjectValue)(item, currentMeta, '');
      metas.push(m);
      return metas;
    }, []).join(itemMetaNameSeparator);
    const value = itemValueName?.reduce((values, currentValue) => {
      const m = (0, _utils.findObjectValue)(item, currentValue, '');
      values.push(m);
      return values;
    }, []).join(itemValueNameSeparator);
    const listId = `${inputName}-${index}`;
    const key = (0, _utils.findObjectValue)(item, itemKeyName, '');
    return /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "result-item"
    }, /*#__PURE__*/React.createElement("input", {
      checked: isChecked(selected, key),
      onChange: onSelect,
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