import { Button, Spinner } from '@wordpress/components';
import { closeSmall, Icon as WPIcon, search } from '@wordpress/icons';
import { jsx as _jsx } from "react/jsx-runtime";
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
    return /*#__PURE__*/_jsx(Spinner, {});
  }
  const handleClick = () => {
    setSearchValue('');
    onFocus();
    onClear();
  };
  if (searchValue.length > 0) {
    return /*#__PURE__*/_jsx(Button, {
      icon: closeSmall,
      label: clearText,
      onClick: handleClick
    });
  }
  return /*#__PURE__*/_jsx(WPIcon, {
    icon: search
  });
}