// Dependency-free validator for the keywords used by products.schema.json.
export function validateSchema(value, schema, root = schema, path = '$') {
  if (schema === true) return [];
  if (schema === false) return [`${path}: disallowed`];
  const errors = [], fail = message => errors.push(`${path}: ${message}`);
  const valid = (v, s, p = path) => validateSchema(v, s, root, p);
  if (schema.$ref) {
    if (!schema.$ref.startsWith('#/')) throw Error(`Unsupported reference: ${schema.$ref}`);
    const target = schema.$ref.slice(2).split('/').reduce((v, k) => v?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], root);
    if (!target) throw Error(`Missing reference: ${schema.$ref}`);
    errors.push(...valid(value, target));
  }
  if (schema.type) {
    const matches = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;
    if (![schema.type].flat().some(matches)) return [...errors, `${path}: expected ${schema.type}`];
  }
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if ('const' in schema && !equal(value, schema.const)) fail('const mismatch');
  if (schema.enum && !schema.enum.some(x => equal(x, value))) fail('enum mismatch');
  if (schema.oneOf && schema.oneOf.filter(s => !valid(value, s).length).length !== 1) fail('oneOf requires exactly one match');
  if (schema.not && !valid(value, schema.not).length) fail('forbidden value');
  if (typeof value === 'string' && schema.pattern && !new RegExp(schema.pattern).test(value)) fail('pattern mismatch');
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) fail('below minimum');
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail('too few items');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail('too many items');
    if (schema.items) value.forEach((v, i) => errors.push(...valid(v, schema.items, `${path}[${i}]`)));
  } else if (value !== null && typeof value === 'object') {
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const [key, v] of Object.entries(value)) {
      if (schema.propertyNames) errors.push(...valid(key, schema.propertyNames, `${path}.${key} (key)`));
      let matched = false;
      if (Object.hasOwn(schema.properties || {}, key)) { matched = true; errors.push(...valid(v, schema.properties[key], `${path}.${key}`)); }
      for (const [pattern, rule] of Object.entries(schema.patternProperties || {})) if (new RegExp(pattern).test(key)) { matched = true; errors.push(...valid(v, rule, `${path}.${key}`)); }
      if (!matched && schema.additionalProperties !== undefined) errors.push(...valid(v, schema.additionalProperties, `${path}.${key}`));
    }
  }
  return errors;
}
// Reject private keys at every depth, including objects intentionally left open by the schema.
export function validateProducts(data, schema) {
  const errors = validateSchema(data, schema);
  function visit(value, path = '$') {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (/^internal_|_zh$|^pending$/.test(key)) errors.push(`${path}.${key}: private key`);
      visit(child, `${path}.${key}`);
    }
  }
  visit(data);
  return errors;
}
