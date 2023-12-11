import { useRef } from "@wordpress/element";
import { BaseControl, useBaseControlProps, Button, Spinner } from "@wordpress/components";
import { closeSmall, Icon, search } from "@wordpress/icons";

export function Input(props) {

    const {
              isLoading,
              onTyping,
              searchValue,
              onClear,
              clearText,
              placeholder,
              hideSearchBox
          } = props;

    const ref = useRef();

    const {baseControlProps, controlProps} = useBaseControlProps(props);

    if (hideSearchBox) {
        return;
    }

    const renderRightButton = () => {
        if (isLoading) {
            return <Spinner/>;
        }

        if (!!searchValue) {
            return (
                <Button
                    icon={closeSmall}
                    label={clearText}
                    onClick={() => {
                        if (typeof onClear === 'function') {
                            onClear();
                        }
                        onTyping('');
                        ref.current?.focus();
                    }}
                />
            );
        }

        return <Icon icon={search}/>;
    };

    return (
        <BaseControl {...baseControlProps}>
            <div className="input-wrapper">
                <input
                    ref={ref}
                    className="input"
                    type="search"
                    placeholder={placeholder}
                    onChange={(event) => onTyping(event.target.value)}
                    autoComplete="off"
                    value={searchValue}
                    {...controlProps}
                />
                <div className="icon">
                    {renderRightButton()}
                </div>
            </div>
        </BaseControl>
    );
}