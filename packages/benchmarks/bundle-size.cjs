const brotli = require('brotli');
const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const getBundleSize = (pacakgeName) =>
  esbuild
    .build({
      write: false,
      bundle: true,
      entryPoints: [require.resolve(pacakgeName)],
      minify: true,
    })
    .then((result) => brotli.compress(result.outputFiles[0].contents).length);

const packages = ['@formatjs/intl', '@lingui/core', 'nanointl'];
Promise.all(packages.map(getBundleSize)).then(async (sizes) => {
  const results = JSON.parse(await fs.readFile(path.resolve(__dirname, './results.json')));
  results.size = {};
  for (let i = 0; i < packages.length; i++) {
    console.log(`${packages[i]}: ${sizes[i]} byte`);
    results.size[packages[i]] = sizes[i];
  }
  await fs.writeFile(path.resolve(__dirname, './results.json'), JSON.stringify(results));
});
