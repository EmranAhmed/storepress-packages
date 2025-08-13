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

  function findObjectValue (obj, path, defValue, notation = ['.', '-', '<>']) {
    // If path is not defined or it has false value
    if (!path) return undefined

    // If path is already an array, use it directly
    if (Array.isArray(path)) {
      const result = path.reduce((prevObj, key) => prevObj && prevObj[key], obj)
      return result === undefined ? defValue : result
    }

    // Normalize notation to array
    const separators = Array.isArray(notation) ? notation : [notation]

    // Create regex pattern to match separators (escape special regex characters)
    const escapedSeparators = separators.map(separator => RegExp.escape(separator))
    const separatorPattern = escapedSeparators.join('')

    // Create regex to split on separators but not within brackets
    const regex = new RegExp(`([^[${separatorPattern}\\]])+`, 'g')
    const pathArray = path.match(regex) || []

    // Find value
    const result = pathArray.reduce(
      (prevObj, key) => prevObj && prevObj[key],
      obj,
    )

    // If found value is undefined return default value; otherwise return the value
    return result === undefined ? defValue : result
  }

  const data = {
    'email': ['Email X', 'y'],
    'options': {
      'data': {
        'deep': [
          {
            'x': 'XXX',
            'y': 'YYY',
          }],
        1000: [
          {
            'x': '100XXX',
            'y': '100YYY',
          }],
      },
    },
  }

  console.log(findObjectValue(data, 'email.[0]', 'def'))

</script>
</body>
</html>