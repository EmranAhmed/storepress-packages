/**
 * External dependencies
 */

import apiFetch from '@wordpress/api-fetch'
import { fn } from '@storybook/test'
import { useState, useEffect } from '@storybook/addons'
import { action } from '@storybook/addon-actions';

/**
 * Internal dependencies
 */
import { SearchListControl } from '@storepress/components/src'
import '@storepress/components/src/search-list-control/style.scss'

export default {
    title      : 'Components/SearchListControl',
    component  : SearchListControl,
    parameters : {
        controls : {expanded : true},
    },

    argTypes : {
        onSearch : {control : false},
        onSelect : {control : false},
        onClear  : {control : false},
    },
}

export const Basic = {

    args   : {
        label          : 'Your favourite fruit',
        isLoading      : false,
        isMultiSelect  : false,
        itemKeyName    : 'value',
        itemValueName  : ['label'],
        itemMetaName   : ['price'],
        itemFilterName : ['label'],
        placeholder    : 'Search available fruits.',
        items          : [{label : '🍏 Apple', value : 'apple', price : '$100'}, {label : '🍌 Banana', value : 'banana', price : '$50'}, {label : '🍇 Grapes', value : 'grapes', price : '$60'}, {label : '🍍 Pineapple', value : 'pineapple', price : '$20'}, {label : '🍊 Orange', value : 'orange', price : '$50'}, {label : '🍉 Watermelon', value : 'watermelon', price : '$30'}, {label : '🍓 Strawberry', value : 'strawberry', price : '$50'}, {label : '🍑 Peach', value : 'peach', price : '$60'}],
        // items: [],
        selected         : ['apple'],
        noItemsFoundText : 'No fruits available.',
        onSearch         : fn(),
        onSelect         : fn(),
        onClear          : fn(),
    },
    render : (args) => {

        const [selected, setSelected]     = useState(args.selected)
        const [searchText, setSearchText] = useState('')

        useEffect(() => {
            // do something if you want to search by api.
        }, [searchText])

        const handleSearch = (value) => {
            setSearchText(value);
            action('onSearch')(value); // Trigger the action
        };

        const handleSelect = (value, checked, isMulti) => {

            setSelected((selectedValues) => {
                const prepared = selectedValues.map((v) => v.toString());

                const newValues = checked ? [...prepared, value] : prepared.filter(v => v !== value)

                return isMulti ? [...new Set(newValues)] : [value]

            });

            action('onSelect')(value, checked, isMulti); // Trigger the action
        };

        const handleClear = (event) => {
            setSearchText('');
            action('onClear')(); // Trigger the action
        };

        return <SearchListControl {...args}
                                  selected={selected}
                                  onSearch={handleSearch}
                                  onSelect={handleSelect}
                                  onClear={handleClear}/>
    },
}

export const Remote = {

    args : {
        itemKeyName      : 'id',
        itemValueName    : ['name'],
        itemMetaName     : ['email', 'address.city'],
        itemFilterName   : ['name', 'email'],
        placeholder      : 'Search users',
        noItemsFoundText : 'User not available',
        selected         : [2],
    },

    render : (args) => {

        const [items, setItems]           = useState([]);
        const [selected, setSelected]     = useState(args.selected);
        const [searchText, setSearchText] = useState('');
        const [isLoading, setIsLoading]   = useState(true);

        useEffect(() => {

            const fetchData = async () => {
                setIsLoading(true);

                try {
                    const response = await apiFetch({
                        url : 'https://jsonplaceholder.typicode.com/users',
                        // url : 'https://jsonplaceholder.typicode.com/comments',
                    });
                    setItems(response);
                } catch (err) {

                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [])

        useEffect(() => {
            // do something if you want to search by api.
        }, [searchText])

        const handleSearch = (value) => {
            setSearchText(value);
            action('onSearch')(value); // Trigger the action
        };

        const handleSelect = (value, checked, isMulti) => {

            setSelected((selectedValues) => {
                const prepared = selectedValues.map((v) => v.toString());

                const newValues = checked ? [...prepared, value] : prepared.filter(v => v !== value)

                return isMulti ? [...new Set(newValues)] : [value]

            });

            action('onSelect')(value, checked, isMulti); // Trigger the action
        };

        const handleClear = () => {
            setSearchText('');
            action('onClear')(); // Trigger the action
        };

        return items && <SearchListControl {...args}
                                           items={items}
                                           isLoading={isLoading}
                                           selected={selected}
                                           onSearch={handleSearch}
                                           onSelect={handleSelect}
                                           onClear={handleClear}/>
    },
}

export const RemoteBig = {

    args : {
        itemKeyName      : 'id',
        itemValueName    : ['title'],
        itemMetaName     : ['id'],
        itemFilterName   : ['title', 'id'],
        placeholder      : 'Search Photos',
        noItemsFoundText : 'Photos not available',
        selected         : [2],
    },

    render : (args) => {

        const [items, setItems]           = useState([]);
        const [selected, setSelected]     = useState(args.selected);
        const [searchText, setSearchText] = useState('');
        const [isLoading, setIsLoading]   = useState(true);

        useEffect(() => {

            (async () => {
                setIsLoading(true);

                const response = await apiFetch({
                    url : 'https://jsonplaceholder.typicode.com/photos',
                });
                setItems(response);
                setIsLoading(false);
            })()
        }, [])

        const handleSearch = (value) => {
            setSearchText(value);
            action('onSearch')(value); // Trigger the action
        };

        const handleSelect = (value, checked, isMulti) => {

            setSelected((selectedValues) => {
                const prepared = selectedValues.map((v) => v.toString());

                const newValues = checked ? [...prepared, value] : prepared.filter(v => v !== value)

                return isMulti ? [...new Set(newValues)] : [value]

            });

            action('onSelect')(value, checked, isMulti); // Trigger the action
        };

        const handleClear = () => {
            setSearchText('');
            action('onClear')(); // Trigger the action
        };

        return items && <SearchListControl {...args}
                                           items={items}
                                           isLoading={isLoading}
                                           selected={selected}
                                           onSearch={handleSearch}
                                           onSelect={handleSelect}
                                           onClear={handleClear}/>
    },
}