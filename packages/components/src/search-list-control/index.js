/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { BaseControl, useBaseControlProps } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { Input } from './input';
import { Results } from './results';

function SearchListControl( {
	id = '',
	hideSearchBox = false,
	itemValueNameSeparator = ' - ',
	itemMetaNameSeparator = ', ',
	...baseProps
} ) {
	const preferredId = useInstanceId(
		SearchListControl,
		'storepress-search-list-control',
		id
	);

	const { baseControlProps, controlProps } = useBaseControlProps( {
		...baseProps,
		id: preferredId,
	} );

	const [ searchValue, setSearchValue ] = useState( '' );

	return (
		<BaseControl { ...baseControlProps } __nextHasNoMarginBottom>
			<div className="storepress-component-search-list">
				{ ! hideSearchBox && (
					<Input
						searchValue={ searchValue }
						setSearchValue={ setSearchValue }
						controlProps={ controlProps }
						{ ...baseControlProps }
					/>
				) }
				<Results
					itemValueNameSeparator={ itemValueNameSeparator }
					itemMetaNameSeparator={ itemMetaNameSeparator }
					searchValue={ searchValue }
					{ ...baseControlProps }
				/>
			</div>
		</BaseControl>
	);
}

SearchListControl.propTypes = {
	id: PropTypes.string,

	label: PropTypes.string,

	help: PropTypes.string,

	hideLabelFromVision: PropTypes.bool,

	className: PropTypes.string,

	items: PropTypes.array.isRequired,

	selected: PropTypes.array,

	disableFilter: PropTypes.bool,

	itemKeyName: PropTypes.string,

	itemValueName: PropTypes.array,

	itemValueNameSeparator: PropTypes.string,

	itemMetaName: PropTypes.array,

	itemMetaNameSeparator: PropTypes.string,

	itemFilterName: PropTypes.array,

	placeholder: PropTypes.string,

	noItemsFoundText: PropTypes.string,

	isLoading: PropTypes.bool,

	hideSearchBox: PropTypes.bool,

	isMultiSelect: PropTypes.bool,

	onSearch: PropTypes.func,

	onSelect: PropTypes.func,

	onClear: PropTypes.func,
};

export default SearchListControl;
