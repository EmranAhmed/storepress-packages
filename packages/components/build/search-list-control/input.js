"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Input = Input;
var _element = require("@wordpress/element");
var _icon = require("./icon");
var _common = require("../common");
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Search input component with loading state and clear functionality.
 *
 * Renders a controlled text input with an accompanying icon that reflects
 * the current state (search icon, loading spinner, or clear button).
 *
 * @param {Object}   props                   - Component props.
 * @param {string}   [props.id]              - HTML id attribute for the input element.
 * @param {boolean}  [props.isLoading=false] - Whether the search is in a loading state.
 * @param {string}   [props.search='']       - Current search input value.
 * @param {string}   [props.placeholder='']  - Placeholder text for the input.
 * @param {string}   [props.clearText='']    - Accessible label for the clear button.
 * @param {Function} [props.onSearch]        - Callback fired when the input value changes.
 * @param {Function} [props.onClear]         - Callback fired when the clear button is clicked.
 * @return {JSX.Element} The search input component.
 *
 * @example
 * const [ search, setSearch ] = useState( '' );
 * const [ isLoading, setIsLoading ] = useState( false );
 *
 * 	const handleSearch = ( value ) => {
 * 		setSearch( value );
 * 		// Optional: trigger API call, analytics, etc.
 * 	};
 *
 * 	const handleClear = () => {
 * 		setSearch( '' );
 * 		// Optional: reset results, analytics, etc.
 * 	};
 *
 * <Input
 *     id="product-search"
 *     search={ search }
 *     placeholder="Search products..."
 *     clearText="Clear search"
 *     onSearch={ handleSearch }
 * 	   onClear={ handleClear }
 * />
 */
function Input(props) {
  const {
    id,
    isLoading = false,
    search = '',
    placeholder = '',
    clearText = '',
    onSearch = _common.noop,
    onClear = _common.noop
  } = props;
  const ref = (0, _element.useRef)(null);
  const handleFocus = (0, _element.useCallback)(() => {
    ref.current?.focus();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    ref: ref,
    className: "input",
    type: "search",
    "aria-label": placeholder || undefined,
    placeholder: placeholder,
    onChange: onSearch,
    autoComplete: "off",
    value: search
  }), /*#__PURE__*/React.createElement("div", {
    className: "icon"
  }, /*#__PURE__*/React.createElement(_icon.Icon, {
    isLoading: isLoading,
    search: search,
    clearText: clearText,
    onClear: onClear,
    onFocus: handleFocus
  })));
}