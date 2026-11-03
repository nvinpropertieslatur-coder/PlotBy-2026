const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Run after `npx expo export --platform web` to prevent native imports regressing.
const directory = path.resolve(process.argv[2] || 'dist', '_expo/static/js/web');
const files = fs.readdirSync(directory).filter(name => name.endsWith('.js'));
assert.ok(files.length, 'Export the web app before running this check.');
const source = files.map(name => fs.readFileSync(path.join(directory, name), 'utf8')).join('\n');
for (const nativeSymbol of ['RNMapsGooglePolygon', 'RNMapsMapView', 'codegenNativeComponent']) {
  assert.ok(!source.includes(nativeSymbol), `Native-only module leaked into web bundle: ${nativeSymbol}`);
}
console.log('Web bundle regression check passed: no native map codegen modules.');
