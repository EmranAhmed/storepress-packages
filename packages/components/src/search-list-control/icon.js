/**
 * External dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import {
	closeSmall,
	Icon as WPIcon,
	search as searchIcon,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { noop } from '../common';

/**
 * Search input icon component that displays different states based on loading and search value.
 *
 * Renders a spinner when loading, a clear button when search has value, or a search icon when empty.
 *
 * @param {Object}   props                   - Component props.
 * @param {boolean}  [props.isLoading=false] - Whether the search is in a loading state.
 * @param {string}   [props.search='']       - Current search input value.
 * @param {string}   [props.clearText='']    - Accessible label for the clear button.
 * @param {Function} [props.onClear]         - Callback fired when the clear button is clicked.
 * @param {Function} [props.onFocus]         - Callback fired when the clear button is clicked, typically to refocus the input.
 * @return {JSX.Element} Spinner, clear button, or search icon based on current state.
 */
export function Icon( props ) {
	const {
		isLoading = false,
		search = '',
		clearText = '',
		onClear = noop,
		onFocus = noop,
	} = props;

	const handleClick = ( event ) => {
		onFocus( event );
		onClear( event );
	};

	if ( isLoading ) {
		return <Spinner />;
	}

	if ( search ) {
		return (
			<Button
				icon={ closeSmall }
				label={ clearText }
				onClick={ handleClick }
			/>
		);
	}

	return <WPIcon icon={ searchIcon } />;
}
