> Here you can see a documentation draft

# nanointl

Nanointl is both tiny and powerful library for dealing with internationalization edge cases.

1. ICU syntax support – translators will be able to write how to display both "one apple" and "5 apple**s**".
2. Rich text formatting – all *emphasises* will be also translated.
3. Type safety – all interpolations are secured.
4. Extendable – some core features are provided as plugins and you can make your own.
5. Works with any framework (while provides React first class citizen support).

## Why nanointl

To be done...

## Installation

```
pnpm add nanointl
# or: npm install nanointl
```

## Getting started

Entrypoint of application localization in nanointl is `intl` object. `intl` object is immutable and represents exactly one locale.

```js
import { makeIntl } from 'nanointl';

let intl = makeIntl('en', {
  secondsPassed: '{passed, plural, one {1 second} other {# seconds}} passed',
  switchLocale: 'Switching locale...',
});

const start = Date.now();
setInterval(() => {
  console.log(intl.formatMessage('secondsPassed', { passed: (Date.now() - start) / 1000 }));
}, 1000);

setTimeout(() => {
  console.log(intl.formatMessage('switchLocale'));
  intl = makeIntl('es', {
    secondsPassed: 'pasaron {passed, plural, one {1 segundo} other {# segundos}}',
    switchLocale: 'Cambio de configuración regional...',
  });
}, 3500);
```

### With React

1. Additionally install `@nanointl/react` package.

```
pnpm add @nanointl/react
# or: npm install @nanointl/react
```

2. Create `IntlProvider` component, `useTranslation` and `useIntlControls` hooks via `makeReactIntl`:

```js
import { makeReactIntl } from '@nanointl/react/src/nanointl-react';
import enMessages from './locales/en.json';
import { tagsPlugin } from 'nanointl/tags';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages);
```

3. Wrap React application into `IntlProvider`.

```diff
+ import { IntlProvider } from './i18n'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
+    <IntlProvider>
      <App />
+    </IntlProvider>
  </React.StrictMode>,
);
```

4. Use localized messages via `useTranslation` or switch locales via `useIntlControls`.

```diff
...
export const App: React.FC = () => {
+ const t = useTranslation();
  ...
  <div className="card">
    <button onClick={() => setCount((count) => count + 1)}>
-     clicked {count} time(s)
+     {t('counter', { count })}
    </button>
    <p>
-     Edit <code>{filePath}</code> and save to test HMR
+      {t('description', {
+        filePath: 'src/App.tsx',
+        code: ({ children }) => <code key="code">{children}</code>,
+      })}
    </p>
  </div>
  ...
```

### Dynamic locales with unplugin (for Vite, Esbuild, Rollup and Webpack)

`@nanointl/unplugin` allows you to bundle application for any specific locale and load other locales dynamically.

1. Install package.

```
pnpm add @nanointl/unplugin
# or: npm install @nanointl/unplugin
```

2. Place localization json files into specific path of your project (like `./src/locales/en.json`, `./src/locales/es.json` and `./src/locales/fr.json`).

3. Import plugin for your bundler (available exports are `nanointlVitePlugin`, `nanointlEsbuildPlugin`,`nanointlRollupPlugin`, `nanointlWebpackPlugin` and just `nanointlUnplugin`).

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

4. Replace hardcoded locales with a special imports of plugin runtime.

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

### Strict typings

nanointl supports automatic ICU message syntax type inference in Typescript.

```ts
const intl = makeIntl('en', {
  secondsPassed: '{passed, plural, one {1 second} other {# seconds}} passed',
  switchLocale: 'Switching locale...',
} as const);

intl.formatMessage('secondsPassed', {});
//                                   ^ Property 'passed' is missing in type '{}'
//                                     but required in type '{ passed: number; }'
```

Messages object should be `const` (without `as const` messages object above would be like `{ secondsPassed: string, switchLocale: string }` what will provide no information for typescript about messages ICU expressions).

#### JSON as const plugin

For messages stored in json files you can use `typescript-json-as-const-plugin` typescript plugin. It changes the way how typescript inferencing JSON files typings to `as const` behavior.

1. Install plugin

```
pnpm add -D typescript-json-as-const-plugin
# or: npm install --save-dev typescript-json-as-const-plugin
```

2. Add plugin to your `tsconfig.json`

```diff
{
  "compilerOptions": {
    ...
    "plugins": [
+      { "name": "typescript-json-as-const-plugin", "include": ["./src/locales"] },
      ...
    ]
  },
  ...
}

```

3. (VS Code only) [switch to workspace version of Typescript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)

4. Restart typescript server.

## Reference

### Message syntax

#### Plurals

#### Select

#### Rich text formatting

##### Markdown

##### XML tags

#### Numbers

#### Dates

### Typescript strong typings

#### JSON-as-const plugin

### React

### All other framework

### Plugin for bundlers

### Writing own plugin

#### Plugin typings

## formatjs

## Contributing
