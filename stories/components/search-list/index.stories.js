/**
 * External dependencies
 */

import { useArgs } from '@storybook/client-api';
import { useState, useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { SearchList } from '@storepress/components/src';
import '@storepress/components/src/search-list/style.scss';

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default {
    title     : 'Components/Search List',
    component : SearchList,
    argTypes  : {

        suggestions : {
            control : 'array', description : 'The list of suggestions to show. This should be an array of objects containing a `id` and `name` property.', table : {
                type : {
                    summary : 'array',

                },
            },
        },

        selected : {
            control : 'array', description : 'The list of selected item.', table : {
                type : {
                    summary : 'array',
                },
            },
        },

        keyName : {
            control : 'text', table : {
                type : {
                    summary : 'string',
                },
            },
        },

        valueName : {
            control : 'text', table : {
                type : {
                    summary : 'string',
                },
            },
        },

        metaName : {
            control : 'text', table : {
                type : {
                    summary : 'string',
                },
            },
        },

        placeholder : {
            control : 'text', description : 'Component placeholder text.', table : {
                type : {
                    summary : 'string',

                },
            },
        },

        isLoading : {
            table      : {
                type : {
                    summary : 'boolean',
                },
            }, control : 'boolean', description : 'Is the component loading?',
        },

        isMultiSelect : {
            table      : {
                type : {
                    summary : 'boolean',
                },
            }, control : 'boolean', description : 'Make searchbox multiselect.',
        },

        hideSearchBox : {
            table      : {
                type : {
                    summary : 'boolean',
                },
            }, control : 'boolean', description : 'Hide Search Box',
        },

        onSearch : {
            table     : {
                type : {
                    summary : 'function',
                },
            }, action : 'onSearch(input)',
        },

        onSelect : {
            table     : {
                type : {
                    summary : 'function',
                },
            }, action : 'onSelect(input)',
        },

        onClear : {
            table     : {
                type : {
                    summary : 'function',
                },
            }, action : 'onClear',
        },
    },

    args : {
        placeholder : 'Search available fruits.',
        keyName     : 'id',
        valueName   : 'name',
        metaName    : '',
        suggestions : [{label : '🍏 Apple', value : 'apple', price : '$100'}, {label : '🍌 Banana', value : 'banana', price : '$50'}, {label : '🍇 Grapes', value : 'grapes', price : '$60'}, {label : '🍍 Pineapple', value : 'pineapple', price : '$20'}, {label : '🍊 Orange', value : 'orange', price : '$50'}, {label : '🍉 Watermelon', value : 'watermelon', price : '$30'}, {label : '🍓 Strawberry', value : 'strawberry', price : '$50'}, {label : '🍑 Peach', value : 'peach', price : '$60'},],
        selected    : ['apple']
    }
};

export const Basic = {

    args      : {
        keyName : 'value', valueName : 'label', metaName : 'price',
    }, render : (args) => {
        const [{suggestions, valueName}, updateArgs] = useArgs();

        const handleSelect = (chosen) => {
            updateArgs({selected : chosen});
        };

        return <SearchList {...args} onSelect={handleSelect}/>;
    }

}

export const Advanced = {

    args : {
        keyName : 'value', metaName : 'price', valueName : 'label.render', suggestions : [{label : {render : '🍏 Apple', raw : 'Apple'}, value : 'apple', price : '$100'}, {label : {render : '🍌 Banana', raw : 'Banana'}, value : 'banana', price : '$50'}, {label : {render : '🍇 Grapes', raw : 'Grapes'}, value : 'grapes', price : '$60'}, {label : {render : '🍍 Pineapple', raw : 'Pineapple'}, value : 'pineapple', price : '$50'}],
    },

    render : (args) => {
        const [{selected, onSelect}, updateArgs] = useArgs();

        const handleOnSelect = (chosen) => {
            updateArgs({selected : chosen});
        };

        return <SearchList {...args} onSelect={handleOnSelect}/>;
    }

}

const Filter = (args) => {

    const {suggestions} = args;

    const [selected, setSelected]       = useState([]);
    const [loading, setLoading]         = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const filteredSuggestions = useMemo(() => {

        if (searchValue.length > 0) {
            const re = new RegExp(escapeRegex(searchValue), 'i');
            return suggestions.map((item) => (re.test(item.label) ? item : false)).filter(Boolean);
        }

        return suggestions

    }, [searchValue, suggestions]);

    return (<div>
        <button onClick={() => setLoading(!loading)}>
            Toggle loading state
        </button>
        <br/>
        <SearchList
            {...args}
            keyName='value'
            valueName='label'
            metaName='price'
            suggestions={filteredSuggestions}
            isLoading={loading}
            selected={selected}
            onSelect={(item) => setSelected(item)}
            onSearch={(value) => setSearchValue(value)}
        />
    </div>);
};

export const Search = (args) => <Filter {...args}/>

