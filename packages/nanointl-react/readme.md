# `@nanointl/react`

Optional package provides first class citizen support for [nanointl](http://github.com/phytonmk/nanointl) with React framework.

## Installation

```
pnpm add @nanointl/react
# or: npm install @nanointl/react
```

## Usage

1. Create `IntlProvider` component, `useTranslation` and `useIntlControls` hooks via `makeReactIntl`:

```js
import { makeReactIntl } from '@nanointl/react/src/nanointl-react';
import enMessages from './locales/en.json';
import { tagsPlugin } from 'nanointl/tags';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages);
```

2. Wrap React application into `IntlProvider`.

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

3. Use localized messages via `useTranslation` or switch locales via `useIntlControls`.

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
