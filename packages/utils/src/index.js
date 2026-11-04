'use strict';
/**
 * StorePress Utils: public API.
 *
 * Each function lives in its own file, grouped by topic. This file only
 * re-exports them, so consumers keep importing from the package root:
 * `import { deepMerge } from '@storepress/utils';`
 */

// String.
export { toKebabCase } from './string/to-kebab-case.js';
export { toSnakeCase } from './string/to-snake-case.js';
export { toConstantCase } from './string/to-constant-case.js';
export { toCamelCase } from './string/to-camel-case.js';
export { toUpperCamelCase } from './string/to-upper-camel-case.js';
export { escapeRegex } from './string/escape-regex.js';

// Object.
export { deepMerge } from './object/deep-merge.js';
export { isPlainObject } from './object/is-plain-object.js';
export { findObjectValue } from './object/find-object-value.js';
export { createWeakElementMap } from './object/create-weak-element-map.js';

// DOM.
export { getElement } from './dom/get-element.js';
export { getElements } from './dom/get-elements.js';
export { getOptionsFromAttribute } from './dom/get-options-from-attribute.js';

// Events.
export { triggerEvent } from './events/trigger-event.js';
export { swipeEvent } from './events/swipe-event.js';
export { createEventManager } from './events/create-event-manager.js';

// Global stores.
export { getPluginInstanceStore } from './store/get-plugin-instance-store.js';
export { getEventStore } from './store/get-event-store.js';
export { getStorePressPlugin } from './store/get-storepress-plugin.js';

// Plugin system.
export { createPluginInstance } from './plugin/create-plugin-instance.js';
export { getPluginInstance } from './plugin/get-plugin-instance.js';
export { createPlugin } from './plugin/create-plugin.js';
export { createStorePressPlugin } from './plugin/create-storepress-plugin.js';

// Testing helpers.
export { testWaitAsync } from './testing/test-wait-async.js';
export { testWaitSync } from './testing/test-wait-sync.js';
