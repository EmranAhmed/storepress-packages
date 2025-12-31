/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { BaseControl, useBaseControlProps } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { Input } from './input';
import { Results } from './results';
import { noop } from '../common';

/**
 * A searchable list control component for selecting items from a filterable list.
 * Supports both single and multi-select modes with customizable item display.
 *
 * @param {Object}          props                                Component props.
 * @param {string}          [props.label='']                     Label text displayed above the control.
 * @param {string}          [props.className='']                 Additional CSS class names to apply to the control.
 * @param {boolean}         [props.hideLabelFromVision=false]    Whether to visually hide the label while keeping it accessible to screen readers.
 * @param {string}          [props.help='']                      Help text displayed below the control.
 * @param {string}          [props.placeholder='']               Placeholder text for the search input.
 * @param {string}          [props.clearText='']                 Accessible text for the clear button.
 * @param {boolean}         [props.isLoading=false]              Whether the component is in a loading state.
 * @param {boolean}         [props.hideSearchBox=false]          Whether to hide the search input box.
 * @param {boolean}         [props.isMultiSelect=false]          Whether multiple items can be selected.
 * @param {Array<Object>}   [props.items=[]]                     Array of item objects to display in the list.
 * @param {string}          [props.itemKeyName='id']             Property name to use as the unique key for each item.
 * @param {string|string[]} [props.itemValueName=['name']]       Property name(s) to display as the item's primary value.
 * @param {string|string[]} [props.itemMetaName=[]]              Property name(s) to display as secondary metadata.
 * @param {string|string[]} [props.itemFilterName=['name']]      Property name(s) to use when filtering items during search.
 * @param {Array}           [props.selected=[]]                  Array of selected item keys or objects.
 * @param {string}          [props.itemValueNameSeparator=' - '] Separator string between multiple value name properties.
 * @param {string}          [props.itemMetaNameSeparator=', ']   Separator string between multiple meta name properties.
 * @param {string}          [props.noItemsFoundText='']          Text displayed when no items match the search query.
 * @param {boolean}         [props.disableItemFilter=false]      Disable inline text filtering from list.
 * @param {Function}        [props.onSearch]                     Callback fired when the search value changes. Receives the search string.
 * @param {Function}        [props.onSelect]                     Callback fired when an item is selected. Receives the selected item.
 * @param {Function}        [props.onClear]                      Callback fired when the search input is cleared.
 * @return {JSX.Element} The rendered search list control component.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    disableItemFilter = false,
    // callbacks
    onSearch = noop,
    onSelect = noop,
    onClear = noop
  } = props;
  const id = useInstanceId(SearchListControl, 'storepress-search-list-control');
  const {
    baseControlProps
  } = useBaseControlProps({
    label,
    className,
    hideLabelFromVision,
    id,
    help
  });
  const [search, setSearch] = useState('');
  const handleSearch = event => {
    const {
      value
    } = event.target;
    setSearch(value);
    onSearch(value);
  };
  const handleClear = () => {
    setSearch('');
    onClear();
  };
  const handleSelect = event => {
    const {
      value,
      checked
    } = event?.target;
    onSelect(value, checked, isMultiSelect);
  };
  return /*#__PURE__*/_jsx(BaseControl, {
    ...baseControlProps,
    __nextHasNoMarginBottom: true,
    children: /*#__PURE__*/_jsxs("div", {
      className: "storepress-component-search-list-control",
      children: [!hideSearchBox && /*#__PURE__*/_jsx(Input, {
        id: id,
        isLoading: isLoading,
        placeholder: placeholder,
        clearText: clearText,
        search: search,
        onClear: handleClear,
        onSearch: handleSearch
      }), /*#__PURE__*/_jsx(Results, {
        id: id,
        disableItemFilter: disableItemFilter,
        isLoading: isLoading,
        isMultiSelect: isMultiSelect,
        items: items,
        itemKeyName: itemKeyName,
        itemValueName: itemValueName,
        itemMetaName: itemMetaName,
        itemFilterName: itemFilterName,
        selected: selected,
        onSelect: handleSelect,
        itemValueNameSeparator: itemValueNameSeparator,
        itemMetaNameSeparator: itemMetaNameSeparator,
        search: search,
        noItemsFoundText: noItemsFoundText
      })]
    })
  });
}
SearchListControl.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  hideLabelFromVision: PropTypes.bool,
  help: PropTypes.string,
  items: PropTypes.array.isRequired,
  selected: PropTypes.array,
  itemKeyName: PropTypes.string,
  itemValueName: PropTypes.array,
  itemValueNameSeparator: PropTypes.string,
  itemMetaName: PropTypes.array,
  itemMetaNameSeparator: PropTypes.string,
  itemFilterName: PropTypes.array,
  placeholder: PropTypes.string,
  noItemsFoundText: PropTypes.string,
  clearText: PropTypes.string,
  isLoading: PropTypes.bool,
  hideSearchBox: PropTypes.bool,
  isMultiSelect: PropTypes.bool,
  disableItemFilter: PropTypes.bool,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  onClear: PropTypes.func
};
export default SearchListControl;