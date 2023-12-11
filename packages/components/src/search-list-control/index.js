/**
 * External dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { findObjectValue, escapeRegex } from './utils'
import { Input } from './input'
import { Results } from './results'

const SearchListControl = (props) => {

    const {items, itemValueName, searchString, onSearch} = props;

    const [searchValue, setSearchValue] = useState(searchString || '');

    const onTyping = (input) => {
        setSearchValue(input);
    };

    const filteredItems = useMemo(() => {

        if (searchValue.length > 0) {

            if (typeof onSearch === 'function') {
                return onSearch(searchValue);
            }

            const re = new RegExp(escapeRegex(searchValue), 'i');

            return items.map((item) => {
                const text = findObjectValue(item, itemValueName);
                return re.test(text) ? item : false;
            }).filter(Boolean);
        }

        return items

    }, [searchValue, items, onSearch]);

    return (
        <div className="storepress-component-search-list">
            <Input onTyping={onTyping} searchValue={searchValue} {...props} />
            <Results {...props} items={filteredItems}/>
        </div>
    );
};

SearchListControl.defaultProps = {
    items            : [],
    selected         : [],
    isLoading        : false,
    isMultiSelect    : false,
    hideSearchBox    : false,
    searchString     : '',
    placeholder      : '',
    clearText        : '',
    noItemsFoundText : '',
    itemKeyName      : 'id',
    itemValueName    : 'name',
    itemMetaName     : '',
    onSearch         : (input) => ([]),
    onSelect         : (input) => ([]),
    onClear          : () => {},
}

SearchListControl.propTypes = {

    className : PropTypes.string,

    itemKeyName : PropTypes.string,

    itemValueName : PropTypes.string,

    itemMetaName : PropTypes.string,

    placeholder : PropTypes.string,

    noItemsFoundText : PropTypes.string,

    isLoading : PropTypes.bool,

    hideSearchBox : PropTypes.bool,

    isMultiSelect : PropTypes.bool,

    items : PropTypes.array.isRequired,

    selected : PropTypes.array.isRequired,

    /**
     * Return filtered values useful for api based filter.
     */
    onSearch : PropTypes.func,

    onSelect : PropTypes.func,

    onClear : PropTypes.func

}

export default SearchListControl;

