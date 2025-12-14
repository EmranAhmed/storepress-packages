/**
 * External dependencies
 */

/**
 * Root Jest configuration for StorePress monorepo
 * Uses @wordpress/jest-preset-default with jsdom for DOM testing
 */

const defaultConfig = require('@wordpress/scripts/config/jest-unit.config.js')

module.exports = {

  ...defaultConfig,

  // Root directory
  rootDir: '.',

  // Use jsdom for DOM testing support
  // testEnvironment: 'jsdom',
  testEnvironment: 'jest-environment-jsdom',

  // Setup file to configure DOM environment before tests
  setupFilesAfterEnv: [
    ...(defaultConfig.setupFilesAfterEnv || []),
    '<rootDir>/jest.setup.js',
  ],

  // Monorepo test file patterns
  testMatch: [
    '<rootDir>/packages/*/tests/*.test.js',
    '<rootDir>/packages/*/tests/**/*.test.js',
  ],

  // Module resolution for monorepo
  //moduleDirectories: [ 'node_modules' ],

  // Module name mapping for package imports
  moduleNameMapper: {
    '^@storepress/utils$': '<rootDir>/packages/utils/src/index.js',
    // '^@storepress/(.*)$': '<rootDir>/packages/$1/src/index.js',
  },

  testPathIgnorePatterns: [
    '/.git/',
    '/node_modules/',
    '/stories/',
    '/bin/',
    '/.storybook/',
    '<rootDir>/.*/build/',
    '<rootDir>/.*/build-module/',
    '<rootDir>/.*/build-types/',
    '<rootDir>/.+.d.ts$',
  ],

  // Transform ES modules
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest', {
        presets: ['@wordpress/babel-preset-default'],
      }],
  },

  // Handle ES modules in node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(@wordpress)/)',
  ],

  // Projects for per-package configuration (optional)
  // Uncomment to use per-package Jest configs
  // projects: [
  // 	'<rootDir>/packages/*/jest.config.js',
  // ],

  // Show verbose test results
  verbose: true,

  // Clear mock calls between tests
  clearMocks: true,

  // Reset module registry between tests
  resetModules: true,

  // Add this: Store cache locally in your project
  cacheDirectory: '<rootDir>/.cache/jest',

}