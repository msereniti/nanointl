# `@nanointl/unplugin`

Unplugin that allows you to bundle application for any specific localization locale and load other locales dynamically. It is part of [nanointl project](http://github.com/phytonmk/nanointl). It may be used even without `nanointl`, but it may start depend on `nanointl` in the future.

## Installation

```
pnpm add @nanointl/unplugin
# or: npm install @nanointl/unplugin
```

## Usage

1. Place localization json files into specific path of your project (like `./src/locales/en.json`, `./src/locales/es.json` and `./src/locales/fr.json`).

2. Import plugin for your bundler (available exports are `nanointlVitePlugin`, `nanointlEsbuildPlugin`,`nanointlRollupPlugin`, `nanointlWebpackPlugin` and just `nanointlUnplugin`).

```diff
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
+ import { nanointlVitePlugin } from '@nanointl/unplugin';

export default defineConfig({
  plugins: [
    react(),
+    nanointlVitePlugin({
+      defaultLocale: 'en',
+      localesDir: './src/locales',
+    }),
  ],
});
```

3. Replace hardcoded locales with a special imports of plugin runtime.

```diff
import { makeReactIntl } from '@nanointl/react/src/nanointl-react';
- import enMessages from './locales/en.json';
+ import { initLocale, initMessages, loadMessages } from '@nanointl/unplugin/runtime';

- let intl = makeIntl('en', {
-   secondsPassed: '{passed, plural, one {1 second} other {# seconds}} passed',
-   switchLocale: 'Switching locale...',
- });
+ let intl = makeIntl(initLocale, initMessages);
+
+ loadMessages.fr().then((frMessages) => intl = makeIntl('fr', frMessages));

# Or, in React application:
- export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages);
+ export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl(initLocale, initMessages, { loadMessages });
```
