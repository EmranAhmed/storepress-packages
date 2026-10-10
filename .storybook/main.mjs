import path from "node:path";
import { fileURLToPath } from 'node:url';

/**
 * WordPress dependencies
 */
import postcssPlugins from '@wordpress/postcss-plugins-preset';

const scssLoaders = [
    'style-loader',
    'css-loader',
    {
        loader  : 'postcss-loader',
        options : {
            postcssOptions : {
                ident   : 'postcss',
                plugins : postcssPlugins,
            },
        },
    },
    'sass-loader',
];

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
	core: {
		disableTelemetry: true,
		disableWhatsNewNotifications: true,
	},
	features: {
		sidebarOnboardingChecklist: false,
		menuOnboardingChecklist: false,
	},
	staticDirs: [ './static' ],
	stories: [
		'../stories/**/*.mdx',
		'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
	],

	addons: [
		'@storybook/addon-webpack5-compiler-babel',
		'@storybook/addon-docs',
	],

	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},

	webpackFinal: async ( config ) => {
		config.module.rules.push( {
			test: /\.scss$/,
			use: scssLoaders,
			include: path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' ),
		} );

		return config;
	},

	/*    typescript: {
        reactDocgen: 'react-docgen-typescript'
    }*/
};
export default config;
