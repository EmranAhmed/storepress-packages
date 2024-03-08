const weakMap = new WeakMap()

export function getElements (selectors) {

  // empty
  if (!selectors) {
    return []
  }

  // querySelector
  if (typeof selectors === 'string') {
    return document.querySelectorAll(selectors)
  }

  // HTMLElement
  if (selectors instanceof window.HTMLElement) {
    return [selectors]
  }
  return selectors
}

export function toCamelCase (string) {
  return string.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2) => {
    if (p2) return p2.toUpperCase()
    return p1.toLowerCase()
  })
}

export function getOptionsFromAttribute (element, attributeName) {
  const attributeKey = toCamelCase(attributeName)
  const rawSettings = element.dataset[attributeKey] // undefined if not found

  if (!rawSettings) {
    return {}
  }
  const settings = rawSettings.replace(/\'/g, '"')
  try {
    return JSON.parse(settings)
  } catch (error) {
    // {'a': 'AAA', 'b': 'BBB'} == valid
    // {a: 'AAA', b: 'BBB'} == Invalid. Key should wrap with single (') or double (") quotes.
    window.console.warn('Seems your settings attribute is not valid JSON. Please wrap keys with quotes.\n\n', error)
    return {}
  }
}

export function createPluginInstance (selectors, options, plugin) {
  const elements = getElements(selectors)
  const instances = []
  for (const element of elements) {
    let instance = weakMap.get(element)
    if (!weakMap.has(element)) {
      instance = new plugin(element, options)
      instance.element = element
      instance.destroy = () => {
        weakMap.delete(element)
        element.dispatchEvent(new Event('destroy'))
      }
      weakMap.set(element, instance)
    }
    instances.push(instance)
  }
  return instances
}

export function getPluginInstance (selectors) {
  const elements = getElements(selectors)
  const instances = []

  if (elements.length === 0) {
    return instances
  }

  for (const element of elements) {
    if (weakMap.has(element)) {
      const instance = weakMap.get(element)
      instances.push(instance)
    }
  }
  return instances
}
