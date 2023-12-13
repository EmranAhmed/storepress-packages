"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeRegex = escapeRegex;
exports.findObjectValue = findObjectValue;
function findObjectValue(obj, path, defValue) {
  // If path is not defined or it has false value
  if (!path) return undefined;
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  var pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  var result = pathArray.reduce(function (prevObj, key) {
    return prevObj && prevObj[key];
  }, obj);
  // If found value is undefined return default value; otherwise return the value
  return result === undefined ? defValue : result;
}
function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}