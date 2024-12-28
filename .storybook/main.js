import path, { join, dirname } from "path";

/**
 * WordPress dependencies
 */
const postcssPlugins = require('@wordpress/postcss-plugins-preset');

const scssLoaders = ({isLazy}) => [
    {
        loader  : 'style-loader',
        options : {injectType : isLazy ? 'lazyStyleTag' : 'styleTag'},
    },
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

/**
 *
 *
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
    stories      : [
        "../stories/**/*.mdx",
        "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ],

    addons       : [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-actions"),
        getAbsolutePath("@storybook/addon-interactions"),
        getAbsolutePath("@storybook/addon-essentials")
    ],

    framework    : {
        name    : getAbsolutePath("@storybook/react-webpack5"),
        options : {},
    },

    features     : {
        babelModeV7  : true,
        emotionAlias : false,
        storyStoreV7 : true,
    },
    docs         : {
        autodocs : "tag",
    },
    webpackFinal : async (config) => {

        config.module.rules.push({
            test    : /\.scss$/,
            use     : scssLoaders({isLazy : false}),
            include : path.resolve(__dirname, '..'),
        });

        return config;
    },

/*    typescript: {
        reactDocgen: 'react-docgen-typescript'
    }*/
};
export default config;
