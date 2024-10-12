/**
 * External dependencies
 */

import apiFetch from '@wordpress/api-fetch';

import { fn } from '@storybook/test';

/**
 * Internal dependencies
 */
import { SearchListControl } from '@storepress/components/src';
import '@storepress/components/src/search-list-control/style.scss';

export default {
    title      : 'Components/Search List Control',
    component  : SearchListControl,
    parameters : {
        controls : {expanded : true},
    }
};

export const Basic = {

    args      : {
        itemKeyName      : 'value',
        itemValueName    : ['label'],
        itemMetaName     : ['price'],
        itemFilterName   : ['label'],
        placeholder      : 'Search available fruits.',
        items            : [{label : '🍏 Apple', value : 'apple', price : '$100'}, {label : '🍌 Banana', value : 'banana', price : '$50'}, {label : '🍇 Grapes', value : 'grapes', price : '$60'}, {label : '🍍 Pineapple', value : 'pineapple', price : '$20'}, {label : '🍊 Orange', value : 'orange', price : '$50'}, {label : '🍉 Watermelon', value : 'watermelon', price : '$30'}, {label : '🍓 Strawberry', value : 'strawberry', price : '$50'}, {label : '🍑 Peach', value : 'peach', price : '$60'},],
        selected         : ['apple'],
        noItemsFoundText : 'No fruits available.',
        onSearch         : fn(),
        onSelect         : fn(),
        onClear          : fn(),
    },
    render : (args) => {
        return <SearchListControl {...args} />;
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
        itemValueName    : ['name'],
        itemMetaName     : ['email', 'address.city'],
        itemFilterName   : ['name', 'email'],
        placeholder      : 'Search users',
        noItemsFoundText : 'User not available',
        onSearch         : fn(),
        onSelect         : fn(),
        onClear          : fn(),
    },

    render : (args, {loaded : {items}}) => {
        return <SearchListControl {...args} items={items}/>;
    }
}