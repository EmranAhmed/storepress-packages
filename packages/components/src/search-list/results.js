import { useInstanceId } from "@wordpress/compose";
import { useLayoutEffect, useState } from "@wordpress/element";
import { findObjectValue } from "./utils";

// @TODO: Add Not found. See: https://github.com/woocommerce/woocommerce/blob/trunk/packages/js/components/src/search-list-control/index.js
export function Results({
                            useKey,
                            useValue,
                            useMeta,
                            selected,
                            suggestions,
                            isMultiSelect,
                            onSelect,
                        }) {

    const [selectedItem, setSelectedItem] = useState(selected);

    const instanceId = useInstanceId(Results);
    const inputName  = `storepress-components-search-list-search-result-item-${instanceId}`;

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
        <div className="results-wrapper">
            <ul>
                {suggestions.map((suggestion, index) => {
                    const key   = findObjectValue(suggestion, useKey);
                    const value = findObjectValue(suggestion, useValue);
                    const meta  = findObjectValue(suggestion, useMeta);
                    const id    = `${inputName}-${index}`

                    return (
                        <li
                            key={index}
                            className="result-item"
                        >
                            <input
                                checked={handleChecked(selected, key)}
                                onChange={handleSelected}
                                id={id}
                                name={inputName}
                                value={key}
                                type={isMultiSelect ? 'checkbox' : 'radio'}
                            />
                            <label
                                htmlFor={id}
                                className="result-item__label"
                            >
								<span className="result-item__title">
									{value}
								</span>
                            </label>
                            {meta && (
                                <small className="result-item__meta">
                                    {meta}
                                </small>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    ) : (
        <div className="results-wrapper error">Not found.</div>
    );
}