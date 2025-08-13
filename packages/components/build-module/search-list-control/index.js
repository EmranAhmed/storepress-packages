/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { BaseControl, useBaseControlProps } from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";

/**
 * Internal dependencies
 */
import { Input } from './input';
import { Results } from './results';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function SearchListControl(props) {
  const {
    id
  } = props;
  const idProps = useInstanceId(SearchListControl, 'search-list-control', id);
  const {
    baseControlProps,
    controlProps
  } = useBaseControlProps({
    ...props,
    id: idProps
  });
  const [searchValue, setSearchValue] = useState('');
  return /*#__PURE__*/_jsx(BaseControl, {
    ...baseControlProps,
    children: /*#__PURE__*/_jsxs("div", {
      className: "storepress-component-search-list",
      children: [/*#__PURE__*/_jsx(Input, {
        searchValue: searchValue,
        setSearchValue: setSearchValue,
        controlProps: controlProps,
        ...baseControlProps
      }), /*#__PURE__*/_jsx(Results, {
        searchValue: searchValue,
        ...baseControlProps
      })]
    })
  });
}

// @TODO: Add itemMetaNameSeparator, itemValueNameSeparator
SearchListControl.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  help: PropTypes.string,
  hideLabelFromVision: PropTypes.bool,
  className: PropTypes.string,
  items: PropTypes.array.isRequired,
  selected: PropTypes.array,
  disableFilter: PropTypes.bool,
  itemKeyName: PropTypes.string,
  itemValueName: PropTypes.array,
  itemMetaName: PropTypes.array,
  itemFilterName: PropTypes.array,
  placeholder: PropTypes.string,
  noItemsFoundText: PropTypes.string,
  isLoading: PropTypes.bool,
  hideSearchBox: PropTypes.bool,
  isMultiSelect: PropTypes.bool,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  onClear: PropTypes.func
};
export default SearchListControl;