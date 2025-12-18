import { useCallback, useLayoutEffect, useRef } from '@wordpress/element';
import { Icon } from './icon';

export function Input( props ) {
	const {
		id,
		isLoading,
		searchValue,
		placeholder,
		clearText,
		setSearchValue,
		onSearch,
		onClear,
	} = props;

	const ref = useRef();

	const handleOnChange = useCallback( ( event ) => {
		const { value } = event?.target;
		setSearchValue( value );
	}, [] );

	const onFocus = () => {
		ref.current?.focus();
	};

	useLayoutEffect( () => {
		onSearch( searchValue );
	}, [ searchValue ] );

	return (
		<div className="input-wrapper">
			<input
				id={ id }
				ref={ ref }
				className="input"
				type="search"
				placeholder={ placeholder }
				onChange={ handleOnChange }
				autoComplete="off"
				value={ searchValue }
			/>
			<div className="icon">
				<Icon
					isLoading={ isLoading }
					searchValue={ searchValue }
					setSearchValue={ setSearchValue }
					onClear={ onClear }
					clearText={ clearText }
					onFocus={ onFocus }
				/>
			</div>
		</div>
	);
}
