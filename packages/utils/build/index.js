'use strict';

/**
 * StorePress Utils: public API.
 *
 * Each function lives in its own file, grouped by topic. This file only
 * re-exports them, so consumers keep importing from the package root:
 * `import { deepMerge } from '@storepress/utils';`
 */

// String.
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createEventManager", {
  enumerable: true,
  get: function () {
    return _createEventManager.createEventManager;
  }
});
Object.defineProperty(exports, "createPlugin", {
  enumerable: true,
  get: function () {
    return _createPlugin.createPlugin;
  }
});
Object.defineProperty(exports, "createPluginInstance", {
  enumerable: true,
  get: function () {
    return _createPluginInstance.createPluginInstance;
  }
});
Object.defineProperty(exports, "createStorePressPlugin", {
  enumerable: true,
  get: function () {
    return _createStorepressPlugin.createStorePressPlugin;
  }
});
Object.defineProperty(exports, "createWeakElementMap", {
  enumerable: true,
  get: function () {
    return _createWeakElementMap.createWeakElementMap;
  }
});
Object.defineProperty(exports, "deepMerge", {
  enumerable: true,
  get: function () {
    return _deepMerge.deepMerge;
  }
});
Object.defineProperty(exports, "escapeRegex", {
  enumerable: true,
  get: function () {
    return _escapeRegex.escapeRegex;
  }
});
Object.defineProperty(exports, "findObjectValue", {
  enumerable: true,
  get: function () {
    return _findObjectValue.findObjectValue;
  }
});
Object.defineProperty(exports, "getElement", {
  enumerable: true,
  get: function () {
    return _getElement.getElement;
  }
});
Object.defineProperty(exports, "getElements", {
  enumerable: true,
  get: function () {
    return _getElements.getElements;
  }
});
Object.defineProperty(exports, "getEventStore", {
  enumerable: true,
  get: function () {
    return _getEventStore.getEventStore;
  }
});
Object.defineProperty(exports, "getOptionsFromAttribute", {
  enumerable: true,
  get: function () {
    return _getOptionsFromAttribute.getOptionsFromAttribute;
  }
});
Object.defineProperty(exports, "getPluginInstance", {
  enumerable: true,
  get: function () {
    return _getPluginInstance.getPluginInstance;
  }
});
Object.defineProperty(exports, "getPluginInstanceStore", {
  enumerable: true,
  get: function () {
    return _getPluginInstanceStore.getPluginInstanceStore;
  }
});
Object.defineProperty(exports, "getStorePressPlugin", {
  enumerable: true,
  get: function () {
    return _getStorepressPlugin.getStorePressPlugin;
  }
});
Object.defineProperty(exports, "isPlainObject", {
  enumerable: true,
  get: function () {
    return _isPlainObject.isPlainObject;
  }
});
Object.defineProperty(exports, "swipeEvent", {
  enumerable: true,
  get: function () {
    return _swipeEvent.swipeEvent;
  }
});
Object.defineProperty(exports, "testWaitAsync", {
  enumerable: true,
  get: function () {
    return _testWaitAsync.testWaitAsync;
  }
});
Object.defineProperty(exports, "testWaitSync", {
  enumerable: true,
  get: function () {
    return _testWaitSync.testWaitSync;
  }
});
Object.defineProperty(exports, "toCamelCase", {
  enumerable: true,
  get: function () {
    return _toCamelCase.toCamelCase;
  }
});
Object.defineProperty(exports, "toConstantCase", {
  enumerable: true,
  get: function () {
    return _toConstantCase.toConstantCase;
  }
});
Object.defineProperty(exports, "toKebabCase", {
  enumerable: true,
  get: function () {
    return _toKebabCase.toKebabCase;
  }
});
Object.defineProperty(exports, "toSnakeCase", {
  enumerable: true,
  get: function () {
    return _toSnakeCase.toSnakeCase;
  }
});
Object.defineProperty(exports, "toUpperCamelCase", {
  enumerable: true,
  get: function () {
    return _toUpperCamelCase.toUpperCamelCase;
  }
});
Object.defineProperty(exports, "triggerEvent", {
  enumerable: true,
  get: function () {
    return _triggerEvent.triggerEvent;
  }
});
var _toKebabCase = require("./string/to-kebab-case.js");
var _toSnakeCase = require("./string/to-snake-case.js");
var _toConstantCase = require("./string/to-constant-case.js");
var _toCamelCase = require("./string/to-camel-case.js");
var _toUpperCamelCase = require("./string/to-upper-camel-case.js");
var _escapeRegex = require("./string/escape-regex.js");
var _deepMerge = require("./object/deep-merge.js");
var _isPlainObject = require("./object/is-plain-object.js");
var _findObjectValue = require("./object/find-object-value.js");
var _createWeakElementMap = require("./object/create-weak-element-map.js");
var _getElement = require("./dom/get-element.js");
var _getElements = require("./dom/get-elements.js");
var _getOptionsFromAttribute = require("./dom/get-options-from-attribute.js");
var _triggerEvent = require("./events/trigger-event.js");
var _swipeEvent = require("./events/swipe-event.js");
var _createEventManager = require("./events/create-event-manager.js");
var _getPluginInstanceStore = require("./store/get-plugin-instance-store.js");
var _getEventStore = require("./store/get-event-store.js");
var _getStorepressPlugin = require("./store/get-storepress-plugin.js");
var _createPluginInstance = require("./plugin/create-plugin-instance.js");
var _getPluginInstance = require("./plugin/get-plugin-instance.js");
var _createPlugin = require("./plugin/create-plugin.js");
var _createStorepressPlugin = require("./plugin/create-storepress-plugin.js");
var _testWaitAsync = require("./testing/test-wait-async.js");
var _testWaitSync = require("./testing/test-wait-sync.js");