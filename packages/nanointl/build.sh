#!/bin/bash

rm -rf ./*.d.ts &&
rm -rf dist &&
tsc --project ./tsconfig.build.json &&
microbundle --entry ./src/index.ts  --generateTypes false --output dist/index.js &&
microbundle --entry ./src/number.ts --generateTypes false --output dist/number.js &&
microbundle --entry ./src/datetime.ts --generateTypes false --output dist/datetime.js &&
microbundle --entry ./src/tags.ts --generateTypes false --output dist/tags.js &&
microbundle --entry ./src/markdown.ts --generateTypes false --output dist/markdown.js &&
microbundle --entry ./src/parse.ts --generateTypes false --output dist/parse.js &&
microbundle --entry ./src/serialize.ts --generateTypes false --output dist/serialize.js &&
microbundle --entry ./src/intlBase.ts --generateTypes false --output dist/intlBase.js &&
mv dist/*.d.ts .