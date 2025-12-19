/**
 * External dependencies
 */
import { addons } from '@storybook/manager-api'
import { themes } from '@storybook/theming'

addons.setConfig({

  theme: {
    ...themes.normal,

    shortcuts: {
      showShortcutsPanel: false,
    },

    // Optional: hide other UI elements
    showPanel: true, // Keep panels but hide shortcuts
    showToolbar: true, // Keep toolbar
    showTabs: true, // Keep story tabs

    // showToolbar: false,
    brandTitle: 'StorePress Components',
    brandUrl: 'https://storepress.com',
    brandImage: './logo.png', // Path to your logo
    brandTarget: '_blank',
    // Typography
    fontBase:
      '"Nunito Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    fontCode: 'monospace',
  },
})
