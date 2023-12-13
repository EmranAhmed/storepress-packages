/** @type { import('@storybook/react').Preview } */

const preview = {
    parameters : {
        actions  : {
            argTypesRegex : "^on[A-Z].*"
        },
        controls : {
            matchers : {
                color : /(background|color)$/i,
                date  : /Date$/i,
            },
        },
    },
    layout     : 'padded',
    docs       : {
        toc : {
            headingSelector : 'h2, h3',
            title           : 'Table of Contents',
            disable         : false,
        },
    },
};

export default preview;

