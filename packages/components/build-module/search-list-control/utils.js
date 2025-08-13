/**
 * Safely retrieves a nested value from an object using a dot notation or bracket notation path.
 *
 * This utility function provides safe access to deeply nested object properties without throwing
 * errors when intermediate properties don't exist. It supports both dot notation (e.g., 'user.profile.name')
 * and bracket notation (e.g., 'users[0].email') for accessing object properties and array elements.
 * If the specified path doesn't exist, it returns a default value instead of throwing an error.
 *
 * @param {Object|Array} obj - The object or array to search in
 * @param {string|string[]} path - The property path as a string (dot/bracket notation) or array of keys
 * @param {*} [defValue] - The default value to return if the path doesn't exist or resolves to undefined
 * @returns {*} The value at the specified path, or the default value if not found
 *
 * @example
 * // Basic object property access
 * const user = {
 *   name: 'John',
 *   profile: {
 *     email: 'john@example.com',
 *     settings: { theme: 'dark' }
 *   }
 * };
 *
 * console.log(findObjectValue(user, 'name')); // 'John'
 * console.log(findObjectValue(user, 'profile.email')); // 'john@example.com'
 * console.log(findObjectValue(user, 'profile.settings.theme')); // 'dark'
 *
 * @example
 * // Array access with bracket notation
 * const data = {
 *   users: ['Alice', 'Bob', 'Charlie'],
 *   posts: [
 *     { title: 'Post 1', author: { name: 'John' } },
 *     { title: 'Post 2', author: { name: 'Jane' } }
 *   ]
 * };
 *
 * console.log(findObjectValue(data, 'users[0]')); // 'Alice'
 * console.log(findObjectValue(data, 'users[2]')); // 'Charlie'
 * console.log(findObjectValue(data, 'posts[0].title')); // 'Post 1'
 * console.log(findObjectValue(data, 'posts[1].author.name')); // 'Jane'
 *
 * @example
 * // Using array paths instead of string paths
 * const obj = { a: { b: { c: 'value' } } };
 *
 * console.log(findObjectValue(obj, ['a', 'b', 'c'])); // 'value'
 * console.log(findObjectValue(obj, ['a', 'b', 'c'])); // Same as 'a.b.c'
 *
 * @example
 * // Safe access with non-existent paths
 * const user = { name: 'John' };
 *
 * console.log(findObjectValue(user, 'profile.email')); // undefined
 * console.log(findObjectValue(user, 'profile.settings.theme')); // undefined
 * console.log(findObjectValue(user, 'friends[0].name')); // undefined
 *
 * // No errors thrown, unlike direct access:
 * // user.profile.email would throw "Cannot read property 'email' of undefined"
 *
 * @example
 * // Using default values
 * const config = {
 *   database: { host: 'localhost' },
 *   features: { auth: true }
 * };
 *
 * console.log(findObjectValue(config, 'database.host', 'defaulthost')); // 'localhost'
 * console.log(findObjectValue(config, 'database.port', 5432)); // 5432 (default)
 * console.log(findObjectValue(config, 'features.notifications', false)); // false (default)
 * console.log(findObjectValue(config, 'cache.redis.url', 'redis://localhost')); // 'redis://localhost'
 *
 * @example
 * // Use case: API response handling
 * function extractUserInfo(apiResponse) {
 *   return {
 *     id: findObjectValue(apiResponse, 'data.user.id'),
 *     name: findObjectValue(apiResponse, 'data.user.profile.displayName', 'Anonymous'),
 *     email: findObjectValue(apiResponse, 'data.user.contact.email', ''),
 *     avatar: findObjectValue(apiResponse, 'data.user.avatar.large.url', '/default-avatar.png'),
 *     isVerified: findObjectValue(apiResponse, 'data.user.verification.status', false),
 *     lastLogin: findObjectValue(apiResponse, 'data.user.metadata.lastLoginAt', null)
 *   };
 * }
 *
 * // Safe even with incomplete API responses
 * const userInfo = extractUserInfo({
 *   data: {
 *     user: {
 *       id: 123,
 *       profile: { displayName: 'John Doe' }
 *       // Missing contact, avatar, verification, metadata
 *     }
 *   }
 * });
 * // Result: { id: 123, name: 'John Doe', email: '', avatar: '/default-avatar.png', isVerified: false, lastLogin: null }
 *
 * @example
 * // Use case: Configuration management
 * class ConfigManager {
 *   constructor(config) {
 *     this.config = config;
 *   }
 *
 *   get(path, defaultValue) {
 *     return findObjectValue(this.config, path, defaultValue);
 *   }
 *
 *   // Convenience methods
 *   getDatabaseUrl() {
 *     return this.get('database.url', 'sqlite://memory');
 *   }
 *
 *   getFeatureFlag(feature) {
 *     return this.get(`features.${feature}.enabled`, false);
 *   }
 *
 *   getThirdPartyApiKey(service) {
 *     return this.get(`integrations.${service}.apiKey`);
 *   }
 * }
 *
 * const config = new ConfigManager({
 *   database: { url: 'postgresql://localhost/myapp' },
 *   features: {
 *     auth: { enabled: true },
 *     notifications: { enabled: false }
 *   },
 *   integrations: {
 *     stripe: { apiKey: 'sk_...' }
 *   }
 * });
 *
 * console.log(config.getDatabaseUrl()); // 'postgresql://localhost/myapp'
 * console.log(config.getFeatureFlag('auth')); // true
 * console.log(config.getFeatureFlag('analytics')); // false (default)
 * console.log(config.getThirdPartyApiKey('stripe')); // 'sk_...'
 * console.log(config.getThirdPartyApiKey('paypal')); // undefined
 *
 * @example
 * // Use case: Form data validation and extraction
 * function processFormSubmission(formData) {
 *   // Extract form values safely
 *   const submission = {
 *     // Personal information
 *     firstName: findObjectValue(formData, 'fields.personal.firstName.value', ''),
 *     lastName: findObjectValue(formData, 'fields.personal.lastName.value', ''),
 *     email: findObjectValue(formData, 'fields.contact.email.value', ''),
 *
 *     // Address (optional section)
 *     address: {
 *       street: findObjectValue(formData, 'fields.address.street.value', ''),
 *       city: findObjectValue(formData, 'fields.address.city.value', ''),
 *       country: findObjectValue(formData, 'fields.address.country.value', 'US')
 *     },
 *
 *     // Preferences
 *     newsletter: findObjectValue(formData, 'fields.preferences.newsletter.checked', false),
 *     notifications: findObjectValue(formData, 'fields.preferences.notifications.value', 'email'),
 *
 *     // Metadata
 *     submittedAt: findObjectValue(formData, 'metadata.timestamp', new Date().toISOString()),
 *     userAgent: findObjectValue(formData, 'metadata.userAgent', 'unknown')
 *   };
 *
 *   // Check for validation errors
 *   const errors = findObjectValue(formData, 'validation.errors', []);
 *   const isValid = findObjectValue(formData, 'validation.isValid', errors.length === 0);
 *
 *   return { submission, errors, isValid };
 * }
 *
 * @example
 * // Use case: Template rendering with dynamic data
 * function renderTemplate(template, data) {
 *   return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
 *     const value = findObjectValue(data, path.trim(), '');
 *     return String(value);
 *   });
 * }
 *
 * const emailTemplate = `
 *   Hello {{user.profile.firstName}},
 *
 *   Your order #{{order.id}} has been {{order.status}}.
 *   Total: ${{order.total}}
 *
 *   Items:
 *   {{order.items[0].name}} - ${{order.items[0].price}}
 *   {{order.items[1].name}} - ${{order.items[1].price}}
 *
 *   Shipping to: {{user.address.street}}, {{user.address.city}}
 * `;
 *
 * const data = {
 *   user: {
 *     profile: { firstName: 'John' },
 *     address: { street: '123 Main St', city: 'New York' }
 *   },
 *   order: {
 *     id: 'ORD-123',
 *     status: 'shipped',
 *     total: 59.99,
 *     items: [
 *       { name: 'Widget A', price: 29.99 },
 *       { name: 'Widget B', price: 29.99 }
 *     ]
 *   }
 * };
 *
 * const rendered = renderTemplate(emailTemplate, data);
 * // Safe rendering even if some template variables are missing
 *
 * @example
 * // Use case: Analytics data extraction
 * function extractMetrics(analyticsResponse) {
 *   return {
 *     // Page metrics
 *     pageViews: findObjectValue(analyticsResponse, 'data.metrics.pageViews.total', 0),
 *     uniqueVisitors: findObjectValue(analyticsResponse, 'data.metrics.visitors.unique', 0),
 *     bounceRate: findObjectValue(analyticsResponse, 'data.metrics.engagement.bounceRate', 0),
 *
 *     // Top content
 *     topPage: findObjectValue(analyticsResponse, 'data.reports.pages[0].url', '/'),
 *     topPageViews: findObjectValue(analyticsResponse, 'data.reports.pages[0].views', 0),
 *
 *     // User behavior
 *     avgSessionDuration: findObjectValue(analyticsResponse, 'data.metrics.session.avgDuration', 0),
 *     pagesPerSession: findObjectValue(analyticsResponse, 'data.metrics.session.avgPages', 1),
 *
 *     // Conversion
 *     conversionRate: findObjectValue(analyticsResponse, 'data.metrics.conversion.rate', 0),
 *     goalCompletions: findObjectValue(analyticsResponse, 'data.metrics.goals.completions', 0),
 *
 *     // Demographics (optional data)
 *     topCountry: findObjectValue(analyticsResponse, 'data.demographics.countries[0].name', 'Unknown'),
 *     mobileTraffic: findObjectValue(analyticsResponse, 'data.demographics.devices.mobile.percentage', 0)
 *   };
 * }
 *
 * @throws {TypeError} If the first argument is null or undefined
 * @see https://lodash.com/docs/4.17.15#get Lodash get() - Similar functionality
 * @see {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce Array.reduce() - MDN
 *
 * @since 1.0.0
 */

export function findObjectValue(obj, path, defValue) {
  // If path is not defined or it has false value
  if (!path) return undefined;
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  const result = pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);
  // If found value is undefined return default value; otherwise return the value
  return result === undefined ? defValue : result;
}
export function escapeRegex(string) {
  return typeof RegExp.escape === 'function' ? RegExp.escape(string) : string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}