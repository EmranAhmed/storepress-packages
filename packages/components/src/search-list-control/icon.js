import { Button, Spinner } from "@wordpress/components";
import { closeSmall, Icon as WPIcon, search } from "@wordpress/icons";

export function Icon(props) {

    const {
              isLoading,
              searchValue,
              setSearchValue,
              onClear,
              clearText,
              onFocus
          } = props;

    if (isLoading) {
        return <Spinner/>;
    }

    const handleClick = () => {
        setSearchValue('');
        onFocus();
        onClear()
    }

    if (searchValue.length > 0) {
        return (
            <Button
                icon={closeSmall}
                label={clearText}
                onClick={handleClick}
            />
        );
    }

    return <WPIcon icon={search}/>;
}