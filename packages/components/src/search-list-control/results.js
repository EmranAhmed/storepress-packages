import { useLayoutEffect, useMemo, useState } from '@wordpress/element';
import { escapeRegex, findObjectValue } from '@storepress/utils';

export function Results( props ) {
	const {
		id,
		disableFilter,
		isLoading,
		searchValue,
		items,
		itemKeyName,
		itemFilterName,
		isMultiSelect,
		itemValueName,
		itemMetaName,
		selected,
		onSelect,
		noItemsFoundText,
	} = props;

	const [ selectedItemKeys, setSelectedItemKeys ] = useState(
		selected || []
	);

	const inputName = `${ id }-result-item`;

	const handleMultiSelection = ( currentId, isSelected ) => {
		if ( isSelected ) {
			setSelectedItemKeys( ( values ) => {
				values.push( currentId );
				return [ ...new Set( values ) ];
			} );
		} else {
			setSelectedItemKeys( ( values ) =>
				values.filter( ( value ) => value !== currentId )
			);
		}
	};

	const handleSingleSelection = ( currentId, isSelected ) => {
		if ( isSelected ) {
			setSelectedItemKeys( [ currentId ] );
		} else {
			setSelectedItemKeys( [] );
		}
	};

	const handleSelected = ( event ) => {
		const { value, checked } = event?.target;

		if ( isMultiSelect ) {
			handleMultiSelection( value, checked );
		} else {
			handleSingleSelection( value, checked );
		}
	};

	const handleChecked = ( selectedItems, currentItem ) => {
		return (
			selectedItems.includes( currentItem ) ||
			selectedItems.includes( currentItem?.toString() )
		);
	};

	const currentItems = useMemo( () => {
		if ( disableFilter ) {
			return items;
		}

		if ( searchValue.length > 0 ) {
			const re = new RegExp( escapeRegex( searchValue ), 'i' );

			return items
				.map( ( item ) => {
					const text = itemFilterName
						?.reduce( ( str, filterKey ) => {
							const innerText = findObjectValue(
								item,
								filterKey
							);
							str.push( innerText );
							return str;
						}, [] )
						.join( ' ' );

					return re.test( text ) ? item : false;
				} )
				.filter( Boolean );
		}

		return items;
	}, [ searchValue, items, disableFilter ] );

	const selectedItems = useMemo( () => {
		return items
			.map( ( item ) => {
				const key = findObjectValue( item, itemKeyName );
				return selectedItemKeys.includes( key ) ||
					selectedItemKeys.includes( key?.toString() )
					? item
					: false;
			} )
			.filter( Boolean );
	}, [ selectedItemKeys, currentItems ] );

	useLayoutEffect( () => {
		onSelect( selectedItemKeys, selectedItems );
	}, [ selectedItemKeys, selectedItems ] );

	if ( isLoading ) {
		return <></>;
	}

	return currentItems.length > 0 ? (
		<div className="results-wrapper">
			<ul>
				{ currentItems.map( ( item, index ) => {
					const key = findObjectValue( item, itemKeyName );
					// const value = findObjectValue(item, itemValueName);

					const meta = itemMetaName
						?.reduce( ( metas, currentMeta ) => {
							const m = findObjectValue( item, currentMeta );
							metas.push( m );
							return metas;
						}, [] )
						.join( ', ' );

					const value = itemValueName
						?.reduce( ( values, currentValue ) => {
							const m = findObjectValue( item, currentValue );
							values.push( m );
							return values;
						}, [] )
						.join( ' - ' );

					const listId = `${ inputName }-${ index }`;

					return (
						<li key={ index } className="result-item">
							<input
								checked={ handleChecked(
									selectedItemKeys,
									key
								) }
								onChange={ handleSelected }
								id={ listId }
								name={ inputName }
								value={ key }
								type={ isMultiSelect ? 'checkbox' : 'radio' }
							/>
							<label
								htmlFor={ listId }
								className="result-item__label"
							>
								<span className="result-item__title">
									{ value }
								</span>
							</label>
							{ meta && (
								<small className="result-item__meta">
									{ meta }
								</small>
							) }
						</li>
					);
				} ) }
			</ul>
		</div>
	) : (
		<div className="results-wrapper error not-found">
			{ noItemsFoundText }
		</div>
	);
}
