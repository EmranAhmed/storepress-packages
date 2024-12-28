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
import { Input } from './input'
import { Results } from './results'

function SearchListControl(props) {

    const {id} = props;

    const idProps = useInstanceId(SearchListControl, 'search-list-control', id);

    const {baseControlProps, controlProps} = useBaseControlProps({...props, id : idProps});

    const [searchValue, setSearchValue] = useState('');

    return (
        <BaseControl {...baseControlProps}>
            <div className="storepress-component-search-list">
                <Input searchValue={searchValue} setSearchValue={setSearchValue} controlProps={controlProps} {...baseControlProps} />
                <Results searchValue={searchValue} {...baseControlProps}/>
            </div>
        </BaseControl>
    );
}

/*SearchListControl.defaultProps = {
    items            : [],
    selected         : [],
    disableFilter    : false,
    isLoading        : false,
    isMultiSelect    : false,
    hideSearchBox    : false,
    placeholder      : '',
    clearText        : '',
    noItemsFoundText : '',
    itemKeyName      : 'id',
    itemValueName    : ['name'],
    itemMetaName     : [],
    itemFilterName   : ['name'],
    onSearch         : (searchString) => {},
    onSelect         : (selectedKeys, selectedItems) => {},
    onClear          : () => {},
}*/
// @TODO: Add itemMetaNameSeparator, itemValueNameSeparator
SearchListControl.propTypes    = {

    id : PropTypes.string,

    label : PropTypes.string,

    help : PropTypes.string,

    hideLabelFromVision : PropTypes.bool,

    className : PropTypes.string,

    items : PropTypes.array.isRequired,

    selected : PropTypes.array,

    disableFilter : PropTypes.bool,

    itemKeyName : PropTypes.string,

    itemValueName : PropTypes.array,

    itemMetaName : PropTypes.array,

    itemFilterName : PropTypes.array,

    placeholder : PropTypes.string,

    noItemsFoundText : PropTypes.string,

    isLoading : PropTypes.bool,

    hideSearchBox : PropTypes.bool,

    isMultiSelect : PropTypes.bool,

    onSearch : PropTypes.func,

    onSelect : PropTypes.func,

    onClear : PropTypes.func
}

export default SearchListControl;

