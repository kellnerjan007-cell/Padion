/**
 * EAS Build post-install hook.
 * Copies platform-specific lightningcss binaries to the nested
 * react-native-css-interop/node_modules/lightningcss directory.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nestedLc = path.join(root, 'node_modules', 'react-native-css-interop', 'node_modules', 'lightningcss');

if (!fs.existsSync(nestedLc)) {
  console.log('[fix-lightningcss] Nested lightningcss not found, skipping.');
  process.exit(0);
}

// Platform binary packages to check and copy
const binaryPkgs = [
  'lightningcss-darwin-arm64',
  'lightningcss-darwin-x64',
  'lightningcss-linux-x64-gnu',
  'lightningcss-linux-arm64-gnu',
];

let copied = 0;

for (const pkg of binaryPkgs) {
  // Look in root node_modules
  const pkgDir = path.join(root, 'node_modules', pkg);
  if (!fs.existsSync(pkgDir)) continue;

  // Find the .node file inside the package
  const files = fs.readdirSync(pkgDir).filter(f => f.endsWith('.node'));
  for (const file of files) {
    const src = path.join(pkgDir, file);
    const dst = path.join(nestedLc, file);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      console.log(`[fix-lightningcss] Copied ${file} to nested lightningcss`);
      copied++;
    }
  }
}

if (copied === 0) {
  console.log('[fix-lightningcss] No binaries copied (already present or not needed).');
} else {
  console.log(`[fix-lightningcss] Done. Copied ${copied} binary file(s).`);
}
