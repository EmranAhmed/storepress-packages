<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Test</title>

</head>
<body>


<?php

$attr = array(
	'email2' => '/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig',
);

?>

<div id="example"
	 data-setting-field--a="This is A"
	 data-setting-field--px="50"
	 data-setting-field--email="/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig"
	 data-setting-field3--options='<?php
     echo json_encode( array( 'x' => 'xxxxxxx' ) ) ?>'
	 data-setting-field="<?php
     echo str_ireplace( '"', '&#034;', json_encode( $attr ) ) ?>"
	 data-setting-field1='<?php
     echo json_encode( $attr ) ?>'
	 data-setting-field2='{"email": "/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig"}'
	 data-setting-field3="{'email': '/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig', 'options': {'x':'XX', 'y': 'YY'}}"></div>


<div id="example2"
	 data-setting-field--options--z--b="/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig"
	 data-setting-field--options--z--a="1000"
	 data-setting-field--options--x="x from deep"
	 data-setting-field--options="{'x':'x from sub', 'y':'y from sub', 'z': {'a': 10, 'b': '50'}}"
	 data-setting-field="{'options': {'x':'x from main', 'y': 'Y from main', 'p': 'from main'}, 'settings': [{'m':10, 'n': '100'}, {'m':['50']}]}">
</div>

<script type="text/javascript">

  function getOptionsFromAttribute ($element, dataAttributeName, defaults = {}) {

    const getValue = (value) => {
      if (typeof value !== 'string') {
        return value
      }

      const lowerValue = value.toLowerCase()
      const isJSON = value.charAt(0) === '{' || value.charAt(0) === '['

      // Check for boolean values
      if (['true', 'yes', 'y'].includes(lowerValue)) {
        return true
      }

      if (['false', 'no', 'n'].includes(lowerValue)) {
        return false
      }

      // Check for Object or Array values
      if (isJSON) {
        return getData(value, reviver)
      }

      // Check for regex pattern: /pattern/flags
      const regexMatch = value.match(/^\/(.+)\/([gimsuyx]*)$/)
      if (regexMatch) {
        try {
          const [, pattern, flags] = regexMatch
          return new RegExp(pattern, flags)
        } catch (error) {
          console.warn(`Invalid regex pattern: ${value}`, error)
          return value // Return original string if regex is invalid
        }
      }

      // Check for numeric values
      if (/^\d+$/.test(value)) {
        return parseInt(value, 10)
      }

      if (/^\d*\.\d+$/.test(value)) {
        return parseFloat(value)
      }

      // Return as string if no type conversion applies
      return value
    }

    const reviver = (key, value) => {
      if (typeof value !== 'string') {
        return value
      }

      return getValue(value)
    }

    const getData = (value, reviver) => {
      const strategies = [
        (val) => val.replaceAll('\'', '"'),
        (val) => val.replaceAll('\'', '"').replaceAll('\\', '\\\\'),
        // Add more strategies here if needed
      ]

      for (const strategy of strategies) {
        try {
          return JSON.parse(strategy(value), reviver)
        } catch {}
      }

      throw new Error('All parsing strategies failed')
    }

    const toCamelCase = (string) => {
      return string.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2) => {
        if (p2) return p2.toUpperCase()
        return p1.toLowerCase()
      })
    }

    // Deep merge function that accepts multiple objects
    const deepMerge = (...sources) => {
      const result = {}
      for (const src of sources) {
        for (const key in src) {
          if (src.hasOwnProperty(key)) {
            const i = typeof src[key] === 'object'
              && src[key] !== null
              && !Array.isArray(src[key])
              && typeof result[key] === 'object'
              && result[key] !== null
              && !Array.isArray(result[key])

            if (i) {
              result[key] = deepMerge(result[key], src[key])
            } else {
              result[key] = src[key]
            }
          }
        }
      }

      return result
    }

    const makeNestedOptions = (nestedData) => {
      const result = {}

      const processLevel = (data, target) => {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const item = data[key]

            // Set the value for current key
            if (item.value !== undefined) {
              target[key] = item.value
            }

            // Process children recursively if they exist
            if (item.child && typeof item.child === 'object') {
              // Ensure target[key] is an object to hold nested properties
              if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = item.value
              }

              // Recursively process the child data
              processLevel(item.child, target[key])
            }
          }
        }
      }

      // Start the recursive processing
      processLevel(nestedData, result)

      return result
    }

    const getOverrideOptions = (keys, dataset) => {

      // Stable sort: fewer hyphens first
      const sortedKeys = keys.map((key, index) => ({ key, index })).sort((a, b) => {
        const hyphenCountA = (a.key.match(/-/g) || []).length
        const hyphenCountB = (b.key.match(/-/g) || []).length
        if (hyphenCountA === hyphenCountB) {
          return a.index - b.index // preserve original order
        }
        return hyphenCountA - hyphenCountB
      }).map(item => item.key)

      const nestedData = {}

      sortedKeys.forEach(key => {
        const parts = key.split('-')
        let oldKey = ''
        let currentKey = ''
        let currentObj = nestedData

        parts.forEach(part => {
          currentKey = currentKey ? currentKey + '-' + part : part

          if (currentKey === part) {
            return
          }

          oldKey = toCamelCase(part)

          if (!currentObj[oldKey]) {
            currentObj[oldKey] = {
              value: getValue(dataset[currentKey]),
              child: {},
            }
          }

          currentObj = currentObj[oldKey].child
        })
      })

      return makeNestedOptions(nestedData)
    }

    let options = {}

    const dataset = { ...$element.dataset }

    const datasetKey = toCamelCase(dataAttributeName)

    const datasetValue = dataset[datasetKey]

    // Parse main data if it exists and is not empty
    if (datasetValue && datasetValue.trim()) {
      try {
        options = getData(datasetValue, reviver)
      } catch (error) {
        console.warn(`Failed to parse JSON from ${dataAttributeName}:`, error)
        options = {}
      }
    }

    // Find all override attributes with pattern: data-attributeName--key
    const overridePrefix = `${datasetKey}-`

    const overrideAttrs = Object.keys(dataset).filter((key) => {
      return key.startsWith(overridePrefix)
    })

    const overrideOptions = getOverrideOptions(overrideAttrs, dataset)

    // Merge base options with override options (overrides take precedence)
    return deepMerge(defaults, options, overrideOptions)
  }

  const $element = document.querySelector('#example2')
  const ATTR = 'setting-field'

  const o = getOptionsFromAttribute($element, ATTR, { options: { z: { c: 'from JS' } } })

  console.log(o)


</script>
</body>
</html>