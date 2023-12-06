/**
 * External dependencies
 */
import { Button, Spinner, BaseControl } from '@wordpress/components';
import { useState, useRef, useLayoutEffect } from '@wordpress/element';
import { Icon, closeSmall, search } from '@wordpress/icons';
import classnames from 'classnames';
import { useInstanceId } from '@wordpress/compose';

function findObjectValue(obj, path, defValue) {
    // If path is not defined or it has false value
    if (!path) return undefined;
    // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
    // Regex explained: https://regexr.com/58j0k
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    // Find value
    const result    = pathArray.reduce(
        (prevObj, key) => prevObj && prevObj[key],
        obj
    );
    // If found value is undefined return default value; otherwise return the value
    return result === undefined ? defValue : result;
}

function SearchControl({
                           className,
                           onChange,
                           onKeyDown,
                           value,
                           label,
                           isLoading = false,
                           placeholder = '',
                           closeText = '',
                           resetText = '',
                           hideLabelFromVision = true,
                           help,
                           onClear,
                           ...restProps
                       }) {
    const searchRef  = useRef();
    const instanceId = useInstanceId(SearchControl);
    const id         = `storepress-components-search-control-${instanceId}`;

    const renderRightButton = () => {
        if (isLoading) {
            return <Spinner/>;
        }

        if (onClear) {
            return (
                <Button
                    icon={closeSmall}
                    label={closeText}
                    onClick={() => {
                        onClear();
                        onChange('');
                        searchRef.current?.focus();
                    }}
                />
            );
        }

        if (!!value) {
            return (
                <Button
                    icon={closeSmall}
                    label={resetText}
                    onClick={() => {
                        onChange('');
                        searchRef.current?.focus();
                    }}
                />
            );
        }

        return <Icon icon={search}/>;
    };

    return (
        <BaseControl
            label={label}
            id={id}
            __nextHasNoMarginBottom={true}
            hideLabelFromVision={hideLabelFromVision}
            help={help}
            className={classnames(
                className,
                'storepress-components-search-control'
            )}
        >
            <div className="storepress-components-search-control__input-wrapper">
                <input
                    {...restProps}
                    ref={searchRef}
                    className="storepress-components-search-control__input"
                    id={id}
                    type="search"
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    autoComplete="off"
                    value={value || ''}
                />
                <div className="storepress-components-search-control__icon">
                    {renderRightButton()}
                </div>
            </div>
        </BaseControl>
    );
}

function SearchResults({
                           useKey,
                           useValue,
                           useMeta,
                           selected,
                           suggestions,
                           isMultiSelect,
                           onSelect,
                       }) {
    const instanceId = useInstanceId(SearchResults);
    const inputName  = `storepress-components-search-result-item-${instanceId}`;

    const [selectedItem, setSelectedItem] = useState(selected);

    const handleMultiSelection = (currentId, isSelected) => {
        if (isSelected) {
            setSelectedItem((values) => {
                values.push(currentId);
                return [...new Set(values)];
            });
        }
        else {
            setSelectedItem((values) =>
                values.filter((value) => value !== currentId)
            );
        }
    };

    const handleSingleSelection = (currentId, isSelected) => {
        if (isSelected) {
            setSelectedItem([currentId]);
        }
        else {
            setSelectedItem([]);
        }
    };

    const handleSelected = (event) => {
        const {value, checked} = event?.target;

        if (isMultiSelect) {
            handleMultiSelection(value, checked);
        }
        else {
            handleSingleSelection(value, checked);
        }
    };

    const handleChecked = (selectedItems, currentItem) => {
        return (
            selectedItems.includes(currentItem) ||
            selectedItems.includes(currentItem?.toString())
        );
    };

    useLayoutEffect(() => {
        onSelect(selectedItem);
    }, [selectedItem]);

    return suggestions.length > 0 ? (
        <div className="storepress-search-list-search-result-wrapper">
            <ul>
                {suggestions.map((suggestion, index) => {
                    const key     = findObjectValue(suggestion, useKey);
                    const value   = findObjectValue(suggestion, useValue);
                    const meta    = findObjectValue(suggestion, useMeta);
                    const inputId = `storepress-components-search-result-id-${instanceId}-${index}`;

                    return (
                        <li
                            key={index}
                            className="storepress-search-list-search-result-item"
                        >
                            <input
                                checked={handleChecked(selected, key)}
                                onChange={handleSelected}
                                id={inputId}
                                name={inputName}
                                value={key}
                                type={isMultiSelect ? 'checkbox' : 'radio'}
                            />
                            <label
                                htmlFor={inputId}
                                className="storepress-search-list-search-result-item__label"
                            >
								<span className="storepress-search-list-search-result-item__title">
									{value}
								</span>
                            </label>
                            {meta && (
                                <small className="storepress-search-list-search-result-item__meta">
                                    {meta}
                                </small>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    ) : (
        ''
    );
}

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
                               placeholder = '',
                               help = '',
                           }) {
    const [currentValue, setCurrentValue] = useState('');

    const onStartTyping = (input) => {
        setCurrentValue(input);
        onSearch(input);
    };

    return (
        <div className="storepress-search-list-wrapper">
            {!hideSearchBox && (
                <div className="storepress-search-list-search-control-wrapper">
                    <SearchControl
                        isLoading={isLoading}
                        onChange={onStartTyping}
                        value={currentValue}
                        placeholder={placeholder}
                        help={help}
                    />
                </div>
            )}

            <SearchResults
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
