/**
 * External dependencies
 */

import { useArgs } from '@storybook/client-api';
import { useState, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import { fn } from '@storybook/test';

/**
 * Internal dependencies
 */
import { SearchListControl } from '@storepress/components/src';
import '@storepress/components/src/search-list-control/style.scss';

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default {
    title     : 'Components/Search List',
    component : SearchListControl,

    args : {
        placeholder      : 'Search available fruits.',
        itemKeyName      : 'id',
        itemValueName    : 'name',
        itemMetaName     : '',
        items            : [{label : '🍏 Apple', value : 'apple', price : '$100'}, {label : '🍌 Banana', value : 'banana', price : '$50'}, {label : '🍇 Grapes', value : 'grapes', price : '$60'}, {label : '🍍 Pineapple', value : 'pineapple', price : '$20'}, {label : '🍊 Orange', value : 'orange', price : '$50'}, {label : '🍉 Watermelon', value : 'watermelon', price : '$30'}, {label : '🍓 Strawberry', value : 'strawberry', price : '$50'}, {label : '🍑 Peach', value : 'peach', price : '$60'},],
        selected         : ['apple'],
        noItemsFoundText : 'No fruits available.'
    }
};

export const Basic = {

    args      : {
        itemKeyName   : 'value',
        itemValueName : 'label',
        itemMetaName  : 'price'
    }, render : (args) => {
        const [{selected}, updateArgs] = useArgs();

        const handleSelect = (chosen) => {
            updateArgs({selected : chosen});
        };

        return <SearchListControl {...args} onSearch={null}/>;
    }
}

export const Remote = {

    loaders : [
        async () => ({
            items : await apiFetch({
                url : 'https://jsonplaceholder.typicode.com/users'
            }),
        }),
    ],

    args : {
        itemKeyName      : 'id',
        itemValueName    : 'name',
        itemMetaName     : 'email',
        onSearch         : null,
        selected         : [],
        placeholder      : 'Search users',
        noItemsFoundText : 'User not available',
    },

    render : (args, {loaded : {items}}) => {
        const [{searchString}, updateArgs] = useArgs();

        const handleOnSelect = (selected) => {
            // updateArgs({searchString : ''});
        };

        return <SearchListControl {...args} items={items}/>;
    }

}

