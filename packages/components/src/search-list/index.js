/**
 * External dependencies
 */
import { useState, useRef, useLayoutEffect } from '@wordpress/element';

import { Input } from './input'
import { Results } from './results'

export function SearchList({
                               selected = [],
                               suggestions = [],
                               isLoading = false,
                               isMultiSelect = false,
                               hideSearchBox = false,
                               keyName = 'id',
                               valueName = 'name',
                               metaName = '',
                               onSearch = (input) => {},
                               onSelect = (input) => {},
                               onClear = () => {},
                               placeholder = '',
                               ...baseProps
                           }) {

    const [currentValue, setCurrentValue] = useState('');

    const onTyping = (input) => {
        setCurrentValue(input);
        onSearch(input);
    };

    return (
        <div className="storepress-component-search-list">
            {!hideSearchBox && (
                <Input
                    isLoading={isLoading}
                    onTyping={onTyping}
                    value={currentValue}
                    placeholder={placeholder}
                    {...baseProps}
                />
            )}

            <Results
                useKey={keyName}
                useValue={valueName}
                useMeta={metaName}
                selected={selected}
                suggestions={suggestions}
                onSelect={onSelect}
                isMultiSelect={isMultiSelect}
            />
        </div>
    );
}
