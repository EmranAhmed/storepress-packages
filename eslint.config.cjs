/**
 * External dependencies
 */
const globals = require( 'globals' );
/**
 * WordPress dependencies
 */
const wordpress = require( '@wordpress/eslint-plugin' );

// All @wordpress/* packages that get externalized to wp.* globals at build time.
// These don't need to be in package.json — WordPress provides them at runtime.
// https://developer.wordpress.org/block-editor/reference-guides/packages/packages-eslint-plugin/
const wordPressPackages = [
	'@wordpress/a11y',
	'@wordpress/annotations',
	'@wordpress/api-fetch',
	'@wordpress/autop',
	'@wordpress/blob',
	'@wordpress/block-directory',
	'@wordpress/block-editor',
	'@wordpress/block-library',
	'@wordpress/block-serialization-default-parser',
	'@wordpress/blocks',
	'@wordpress/commands',
	'@wordpress/components',
	'@wordpress/compose',
	'@wordpress/core-commands',
	'@wordpress/core-data',
	'@wordpress/customize-widgets',
	'@wordpress/data',
	'@wordpress/data-controls',
	'@wordpress/date',
	'@wordpress/deprecated',
	'@wordpress/dom',
	'@wordpress/dom-ready',
	'@wordpress/edit-post',
	'@wordpress/edit-site',
	'@wordpress/edit-widgets',
	'@wordpress/editor',
	'@wordpress/element',
	'@wordpress/escape-html',
	'@wordpress/format-library',
	'@wordpress/hooks',
	'@wordpress/html-entities',
	'@wordpress/i18n',
	'@wordpress/icons',
	'@wordpress/interactivity',
	'@wordpress/interactivity-router',
	'@wordpress/interface',
	'@wordpress/is-shallow-equal',
	'@wordpress/keyboard-shortcuts',
	'@wordpress/keycodes',
	'@wordpress/list-reusable-blocks',
	'@wordpress/media-utils',
	'@wordpress/notices',
	'@wordpress/nux',
	'@wordpress/patterns',
	'@wordpress/plugins',
	'@wordpress/preferences',
	'@wordpress/preferences-persistence',
	'@wordpress/primitives',
	'@wordpress/priority-queue',
	'@wordpress/private-apis',
	'@wordpress/redux-routine',
	'@wordpress/reusable-blocks',
	'@wordpress/rich-text',
	'@wordpress/router',
	'@wordpress/server-side-render',
	'@wordpress/shortcode',
	'@wordpress/style-engine',
	'@wordpress/token-list',
	'@wordpress/url',
	'@wordpress/viewport',
	'@wordpress/warning',
	'@wordpress/widgets',
	'@wordpress/wordcount',
];

const restrictedImports = [
	{
		name: 'lodash',
		message:
			'This Lodash method is not recommended. Please use native functionality instead. If using `memoize`, please use `memize` instead.',
	},
	{
		name: 'classnames',
		message:
			"Please use `clsx` instead. It's a lighter and faster drop-in replacement for `classnames`.",
	},
	{
		name: 'redux',
		importNames: [ 'combineReducers' ],
		message: 'Please use `combineReducers` from `@wordpress/data` instead.',
	},
];

module.exports = [
	{
		ignores: [
			'bin/',
			'**/build/',
			'**/build-module/',
			'**/build-style/',
			'**/node_modules/',
			'stories/',
			'**/tests/',
			'.storybook/',
			'.github/',
			'.cache/',
			'.coverage/',
			'jest.*',
		],
	},
	...wordpress.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				jQuery: 'readonly',
				wp: 'writable',
				StorePress: 'writable',
				JSX: 'readonly',
			},
		},
		settings: {
			'import/core-modules': wordPressPackages,
			'import/resolver': {
				node: {
					extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
				},
			},
		},
		rules: {
			'@wordpress/dependency-group': 'warn',
			'no-unused-vars': 'warn',
			'no-console': 'off',
			'@wordpress/no-unsafe-wp-apis': 'warn',
			'no-restricted-imports': [
				'error',
				{
					paths: restrictedImports,
				},
			],
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: [ 'default' ],
				},
			],
		},
	},
];
