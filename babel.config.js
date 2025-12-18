module.exports = (api) => {
  api.cache(true)

  return {
    'sourceType': 'unambiguous',
    presets: [
      '@wordpress/babel-preset-default'],
  }
}