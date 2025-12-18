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
    // callbacks
    onSearch = () => {},
    onSelect = () => {},
    onClear = () => {}
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
  const [searchValue, setSearchValue] = useState('');
  return /*#__PURE__*/_jsx(BaseControl, {
    ...baseControlProps,
    __nextHasNoMarginBottom: true,
    children: /*#__PURE__*/_jsxs("div", {
      className: "storepress-component-search-list-control",
      children: [!hideSearchBox && /*#__PURE__*/_jsx(Input, {
        id: id,
        isLoading: isLoading,
        searchValue: searchValue,
        placeholder: placeholder,
        clearText: clearText,
        setSearchValue: setSearchValue,
        onClear: onClear,
        onSearch: onSearch
      }), /*#__PURE__*/_jsx(Results, {
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
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  onClear: PropTypes.func
};
export default SearchListControl;