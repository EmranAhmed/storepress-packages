/** @type { import('@storybook/react').Preview } */

import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { Global, css } from '@emotion/react';


const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;


const GlobalStyles = () => (
    <Global
        styles={css`
      body {
        font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    `}
    />
);

export const decorators = [
    withThemeFromJSXProvider({
        GlobalStyles, // Adds your GlobalStyles component to all stories
    }),
];
