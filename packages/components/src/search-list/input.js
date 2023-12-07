import { useRef } from "@wordpress/element";
import { useInstanceId } from "@wordpress/compose";
import { BaseControl, useBaseControlProps, Button, Spinner } from "@wordpress/components";
import { closeSmall, Icon, search } from "@wordpress/icons";
import classnames from "classnames";

export function Input({
                          value,
                          isLoading = false,
                          placeholder = '',
                          closeText = '',
                          resetText = '',
                          onTyping,
                          onKeyDown,
                          onClear,
                          ...baseProps
                      }) {

    const ref = useRef();

    const {baseControlProps} = useBaseControlProps(baseProps);

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
                        onTyping('');
                        ref.current?.focus();
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
                    onKeyDown={onKeyDown}
                    autoComplete="off"
                    value={value || ''}
                />
                <div className="icon">
                    {renderRightButton()}
                </div>
            </div>
        </BaseControl>
    );
}