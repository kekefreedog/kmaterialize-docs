import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(dirname(require.resolve('kmaterialize')), '../..');
const types = readFileSync(resolve(root, 'dist/js/materialize.d.ts'), 'utf8');
const required = ['CrazyLoading', 'CrazyButton', 'Kmcomponent', 'OrgChart', 'initMaterialButtons', 'initListChecklist', 'enableCardHandles'];
const missing = required.filter(name => !new RegExp(`\\b${name}\\b`).test(types));
for (const file of ['dist/js/tippy.mjs', 'dist/js/tippy.d.ts', 'sass/enhancement/spreadsheet.scss']) {
  if (!existsSync(resolve(root, file))) missing.push(file);
}
if (missing.length) {
  throw new Error(`The installed kmaterialize does not provide documented features: ${missing.join(', ')}. Build/link the updated library for development, or publish/install its release before building published docs.`);
}
for (const folder of ['src/components', 'src/enhancement']) {
  if (existsSync(resolve(folder))) throw new Error(`${folder} must live in kmaterialize; keep only examples in the documentation repository.`);
}
console.log('Documentation features are provided by the installed kmaterialize package.');
