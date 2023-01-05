#!/bin/bash

microbundle --entry ./src/index.ts  --generateTypes false --output dist/index.js &&
microbundle --entry ./src/number.ts --generateTypes false --output dist/number.js &&
microbundle --entry ./src/datetime.ts --generateTypes false --output dist/datetime.js &&
microbundle --entry ./src/tags.ts --generateTypes false --output dist/tags.js &&
microbundle --entry ./src/markdown.ts --generateTypes false --output dist/markdown.js &&
microbundle --entry ./src/parse.ts --generateTypes false --output dist/parse.js &&
microbundle --entry ./src/serialize.ts --generateTypes false --output dist/serialize.js &&
microbundle --entry ./src/intlBase.ts --generateTypes false --output dist/intlBase.js &&
cp src/index.ts index.ts &&
cp src/makeIntl.ts makeIntl.ts &&
cp src/number.ts number.ts &&
cp src/datetime.ts datetime.ts &&
cp src/tags.ts tags.ts &&
cp src/markdown.ts markdown.ts &&
cp src/parse.ts parse.ts &&
cp src/serialize.ts serialize.ts &&
cp src/intlBase.ts intlBase.ts &&
cp src/typings.ts typings.ts
# &&
# cp src/index.ts
# mv dist/*.d.ts . &&
# cp src/*.d.ts .