/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';

/**
 * Checkboxes allow the user to select one or more items from a set.
 *
 * ```jsx
 * import { CheckboxControl } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyCheckboxControl = () => {
 *   const [ isChecked, setChecked ] = useState( true );
 *   return (
 *     <Checkbox
 *       label="Is author"
 *       checked={ isChecked }
 *       onChange={ setChecked }
 *     />
 *   );
 * };
 * ```
 */
export default function Checkbox(props) {
    const {label, checked, onChange} = props;

    const [showCheckedIcon, setShowCheckedIcon] = useState(false);

    // Run the following callback every time the `ref` (and the additional dependencies) change.
    const ref = useRefEffect((node) => {
        if (!node) {
            return;
        }

        setShowCheckedIcon(node.matches(':checked'));
    }, [checked]);

    const onChangeValue = (event) => onChange(event.target.checked);

    return (
        <label><input type="checkbox" ref={ref} onClick={onChangeValue} checked={checked}/>{label} - {showCheckedIcon}</label>
    );
}