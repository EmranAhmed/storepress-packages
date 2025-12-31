"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = void 0;
/**
 * A no-operation function that does nothing and returns undefined.
 *
 * Used as a stable default callback placeholder to prevent unnecessary
 * re-renders caused by new function references being created on each render.
 *
 * @param {...any} _args - Arguments (ignored).
 * @return {void}
 *
 * @type {() => void}
 * @example
 * // As a default prop value
 * const { onClick = noop } = props;
 */
const noop = (..._args) => {}; // eslint-disable-line no-unused-vars
exports.noop = noop;