# nanointl

Resolve all your localization troubles by delegating locales edge cases to translators and be on rise to the occasion.

1. [Supercharged with ICU](#message-syntax) – Never give up how to deal with plurals in every single language.
2. [Type safe](#strict-typings) – {variables_interpolations} are analyzed with TypeScript Template Literal Types.
3. [Extendable with Plugins](#writing-own-plugin) – Provides basic plugins and allows to unlock unlimited power with your own.
4. [Small and fast](#benchmarks) – Core functionality takes less then 2.7kb of your app bundle.

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
// src/i18n.ts
import { makeReactIntl } from '@nanointl/react';
import enMessages from './locales/en.json';
import { tagsPlugin } from 'nanointl/tags';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages);
```

3. Wrap React application into `IntlProvider`.

```diff
// src/main.tsx
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
// src/App.tsx
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

### Dynamic locales

With plugins for Vite, Esbuild, Rollup and Webpack.

`@nanointl/unplugin` allows you to bundle application for any specific locale and load other locales dynamically.

1. Install package.

```
pnpm add @nanointl/unplugin
# or: npm install @nanointl/unplugin
```

2. Place localization json files into specific path of your project (like `./src/locales/en.json`, `./src/locales/es.json` and `./src/locales/fr.json`).

3. Import plugin for your bundler (available exports are `nanointlVitePlugin`, `nanointlEsbuildPlugin`, `nanointlRollupPlugin`, `nanointlWebpackPlugin` and just `nanointlUnplugin`).

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
// src/i18n.ts
import { makeReactIntl } from '@nanointl/react';
- import enMessages from './locales/en.json';
+ import { initLocale, initMessages, loadMessages } from '@nanointl/unplugin/runtime';

- let intl = makeIntl('en', {
-   secondsPassed: '{passed, plural, one {1 second} other {# seconds}} passed',
-   switchLocale: 'Switching locale...',
- });
+ let intl = makeIntl(initLocale, initMessages);
+
+ loadMessages.fr().then((frMessages) => intl = makeIntl('fr', frMessages));

// Or, in React application:
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

```ts
// how json import looks without plugin
import obj from './obj.json';
// { key1: string, key2: { key3: number } }

// how json import looks with plugin
import obj from './obj.json';
// { key1: "Hello world", key2: { key3: 3 } }
```

1. To use it, firstly you need to install plugin

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
   +      { "name": "typescript-json-as-const-plugin", "include": ["src/locales/*.json"] },
         ...
       ]
     },
     ...
   }
   ```

3. ([VS Code](https://code.visualstudio.com) only) [switch to workspace version of Typescript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)

4. Restart typescript server.
   1. [tsc cli](https://www.npmjs.com/package/typescript) – kill process and restart it.
   2. [VS Code](https://code.visualstudio.com) – while any .ts file is opened, press ⌘/cmd+shift+p to open command palette and type to find command "TypeScript: restart TS server"

## Reference

### Message syntax

Nanointl supports interpolation in ICU syntax.

- To insert variable into message, it uses curved brackets: `Current account: {accountName}` will produce "Current account: Guest".
- To add curved brackets as a part of message, use single quotes: `List of brackets: '{}'[]()` will produce "List of brackets: {}\[]()".
- To add single quote, write it twice: `John O''Connell` will produce "John O'Connell".
- To use special interpolation mechanism (such as plurals or select), write it's name after coma and pass params: `Balance: {balance, number, ::.00}` with input `balance=42` will produce "Balance: 42.00".

#### Plurals

Plurals mechanism is available in nanointl out of the box. In plurals you can specify how to write parts of text that depend on provided number variables: `{passed, plural, one {1 second} other {# seconds}} passed` may produce "1 second passed" or "5 seconds passed" depending on value provided in `passed` variable.

Following values are allowed: `zero`, `one`, `two`, `few`, `many`, `other` and _exacts_.

While English localization may require only `one` and `other` forms, other languages may require each of them.

_Exacts_ syntax allows you to specify how to handle specific values of provided variables: `{passed, plural, one {1 second} other {# seconds} =42{Answer to the Ultimate Question of Life, the Universe, and Everything seconds}} passed`

You can use special `#` symbol to insert parent variable.

#### Select

Select mechanism is available in nanointl out of the box. It allows translators to specify how text may change depending on provided variables: `Send money to {gender, select, male {him} female {her} other {them}} via {transactionProvider}.`.

#### Rich text formatting

In some cases rich text formatting like **strong** or _emphasized_ text is supported in nanointl via plugins.

##### Markdown

Provides partial support of Markdown syntax. May be enabled via markdown plugin.

```diff
+import { markdownPlugin } from 'nanointl/markdown';

const intl = makeIntl(locale, { markdownExample: `Hello **world**` },
+ { plugins: [markdownPlugin] },
);
```

Allows you to use **strong** syntax (via wrapping text into `*text*` or `**text**`), _emphasis_ syntax (via wrapping text into `_text_` or `__text__`), _code_ syntax (via wrapping text into backticks (\`)) and [link](https://google.com) syntax (via syntax `[link text](https://link_url)`).

Requires you to specify how to render markdown chunks in the second argument of `formatMessage` call.

```js
intl.formatMessage('markdownExample', { strong: ({ children }) => `<b>${children}</b>` }); // rendering to simple html
intl.formatMessage('markdownExample', { strong: ({ children }) => <b>{children}</b> }); // rendering to React element
```

Markdown syntax may be escaped with single quotes.

##### XML tags

Provides partial support of Markdown syntax. May be enabled via tags plugin.

```diff
+import { tagsPlugin } from 'nanointl/tags';

const intl = makeIntl(locale, { tagExample: `Hello <b>world</b>` },
+ { plugins: [tagsPlugin] },
);
```

Requires you to specify how to render every used tag in the second argument of `formatMessage` call.

```js
intl.formatMessage('tagExample', { b: ({ children }) => `<b>${children}</b>` }); // rendering to simple html
intl.formatMessage('tagExample', { b: ({ children }) => <b>{children}</b> }); // rendering to React element
```

#### Numbers

Provides powerful support of numbers formatting. May be enabled via numbers plugin.

```diff
+import { numbersPlugin } from 'nanointl/numbers';

const intl = makeIntl(locale, { numberExample: `Balance: {balance, number, ::.00 sign-always}` },
+ { plugins: [numbersPlugin] },
);
```

Available tokens:

- `percent` (alias is `%`) outputs fraction as a percent. E.g. `::percent` with 0.25 as input will produce "25%".
- `scale/100` (where `100` is a custom number) multiples values by provided number. The number may be a fraction.
- `measure-unit/meter` (where `meter` may be replaced with any environment supported [unit](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#unit), alias is `unit/meter`) adds a measure unit to output.
- `currency/USD` (where `USD` may be replaced with any environment supported currency).
- `unit-width-iso-code` enforces output of unit as a localized ISO symbol (such as €).
- `unit-width-short` enforces output of unit as a short word (such as USD).
- `unit-width-full-name` enforces output of unit as a full name (such as "US dollars").
- `unit-width-narrow` enforces output of unit as a localized symbol (even if there is no in ISO, such as ₴).
- `compact-short` (alias is `K`) makes output compact by adding symbols like K, M, B, etc. after scaled number.
- `compact-long` (alias is `KK`) makes output compact by adding words like thousand, million, billion, etc. after scaled number.
- `sign-auto` enforces displaying numbers sign (`+` or `-`) behaviour based on locale.
- `sign-always` (alias is `+!`) enforces always displaying of numbers sign (`+` or `-`).
- `sign-never` (alias is `+_`) enforces never displaying of numbers sign (`+` or `-`).
- `sign-except-zero` (alias is `+?`) enforces always displaying of numbers sign (`+` or `-`) for all numbers except zero.
- `sign-accounting` (alias is `()`) enforces sign accounting for units based on locale default behaviour (such as wrapping into partnership negative value of USD).
- `sign-accounting-always` (alias is `()!`) enforces sign accounting for units (such as wrapping into partnership negative value of USD).
- `sign-accounting-except-zero` (alias is `()?`) enforces sign accounting for units that value is not equal to zero (such as wrapping into partnership negative value of USD).
- `group-always` enforces to always group digits (like `100,000`).
- `group-auto` enforces digits grouping behaviour based on locale.
- `group-off` (alias is `,_`) disables digits grouping.
- `group-min2` (alias is `,?`) enforces grouping of symbols with minimum 2 digits in each group.
- `integer-width` enforces number output as an integer.

##### Count of digits

You can use numbers template to limit minimal of maximum count of digits in number output.

Symbol `0` represents minimal count of digits while `#` represents maximum count of digits.
You can also use `*` symbol after minimal count of digits to mark that there is no maximum limit.

When template starts with a dot symbol (`.`), fraction digits are affected. When template starts with slash symbol (`/`), integer part digits are affected.

If template starts with `integer-width/`, integer part digits and fraction part is hidden.

Examples:

1. `.00##` means that number serializer will write at least 2 and at most 4 fraction digits.
2. `.00*` means that number serializer will write at least 2 fraction digits.
3. `.00` means that number serializer will write 2 fraction digits.
4. `.00` means that number serializer will write 2 fraction digits.

- `00.` (where count of `0` sign is not limited) sets minimal count of fraction digits. E.g. `::.00` with 25 as input will produce "25.00".

##### Number templates examples

Examples for `en` locale :

- `::percent` with 0.25 as input will produce "25%"
- `::%` with 0.25 as input will produce "25%"
- `::.00` with 25 as input will produce "25.00"
- `::percent .00` with 0.25 as input will produce "25.00%"
- `::% .00` with 0.25 as input will produce "25.00%"
- `::scale/100` with 0.3 as input will produce "30"
- `::percent scale/100` with 0.003 as input will produce "30%"
- `::%x100` with 0.003 as input will produce "30%"
- `::measure-unit/meter` with 5 as input will produce "5 m"
- `::unit/meter` with 5 as input will produce "5 m"
- `::measure-unit/meter unit-width-full-name` with 5 as input will produce "5 meters"
- `::unit/meter unit-width-full-name` with 5 as input will produce "5 meters"
- `::currency/CAD` with 10 as input will produce "CA$10.00"
- `::currency/CAD unit-width-narrow` with 10 as input will produce "$10.00"
- `::compact-short` with 5000 as input will produce "5K"
- `::K` with 5000 as input will produce "5K"
- `::compact-long` with 5000 as input will produce "5 thousand"
- `::KK` with 5000 as input will produce "5 thousand"
- `::compact-short currency/CAD` with 5000 as input will produce "CA$5K"
- `::K currency/CAD` with 5000 as input will produce "CA$5K"
- `::group-off` with 5000 as input will produce "5000"
- `::,\_` with 5000 as input will produce "5000"
- `::group-always` with 15000 as input will produce "15,000"
- `::,?` with 15000 as input will produce "15,000"
- `::sign-always` with 60 as input will produce "+60"
- `::+!` with 60 as input will produce "+60"
- `::sign-always` with 0 as input will produce "+0"
- `::+!` with 0 as input will produce "+0"
- `::sign-except-zero` with 60 as input will produce "+60"
- `::+?` with 60 as input will produce "+60"
- `::sign-except-zero` with 0 as input will produce "0"
- `::+?` with 0 as input will produce "0"
- `::sign-accounting currency/CAD` with -40 as input will produce "(CA$40.00)"
- `::() currency/CAD` with -40 as input will produce "(CA$40.00)"

#### Dates and times

Provides powerful support of dates and times formatting. May be enabled via datetime plugin.

Unlike to dates focused libraries such as `dayjs` or `momentjs`, order of displayed parts is not controlled by provided pattern and delegated to environment localization mechanisms. Tokens in pattern controls only appearance of date/time part if it is suitable for current locale.

Params may be either pattern that starts with `::` with tokens after it or set of following values: `short`, `medium`, `long` and `full`.

```diff
+import { datetimePlugin } from 'nanointl/datetime';

const intl = makeIntl(locale, {
  patternExample: `Will arrive at: {arriveTime, time, ::hh mm ss}`,
  literalExample: `Will arrive at: {arriveTime, time, medium}`
},
+ { plugins: [datetimePlugin] },
);
```

Available date/time tokens:

- `G` (or `GG`, `GGG`, `GGGG`) – Era designators.
- `yy` (or `yyyy`) – Years.
- `M` (or `MM`, `MMM`, `MMMM`, `MMMMM`) – Months.
- `d` (or `dd`) – Days.
- `E` (or `EE`, `EEE`) – Days of week.
- `j` (or `jj`) – Hours.
- `h` (or `hh`) – Hours [1-12].
- `H` (or `HH`) – Hours [0-23].
- `m` (or `mm`) – Minutes.
- `s` (or `ss`) – Seconds.
- `z` (or `zz`, `zzz`, `zzzz`) – Time Zones.

### Writing own plugin

To write you own plugin you should create an object that satisfies type `NanointlPlugin`:

```ts
import { NanointlPlugin } from 'nanointl';

export const numberPlugin: NanointlPlugin<UserOptions> = {
  name: 'my-awesome-plugin',
  init({ addParser, addSerializer, addPostParser }) {
    addParser('super-token', () => {...});
    addSerializer('super-token', () => {...});
    addPostParser(() => {...});
  },
};
```

Adding parser and serializer from plugin enables support of named tokens: `Hello, {username, super-token, custom-parameters}`.

Adding post parsers allows plugin to parse syntax unrelated to ICU (such as markdown and tags plugins do).

See built-in plugins for examples:

1. [datetime](https://github.com/phytonmk/nanointl/blob/main/packages/nanointl/src/datetime.ts)
2. [number](https://github.com/phytonmk/nanointl/blob/main/packages/nanointl/src/number.ts)
3. [markdown](https://github.com/phytonmk/nanointl/blob/main/packages/nanointl/src/markdown.ts)
4. [tags](https://github.com/phytonmk/nanointl/blob/main/packages/nanointl/src/tags.ts)

## Benchmarks

> Better benchmarks are planned to be done.

Core bundle size:
| lingUi | formatjs | nanointl |
| --- | --- | --- |
| 3526 B | 28322 B | 2714 B |

Formatting 1k messages on same machine:
| lingUi | formatjs | nanointl |
| --- | --- | --- |
| 74521 ns | 90865 ns | 62899 ns |

## Contributing

If you found bug, want to add new feature or have question feel free to [open an issue](https://github.com/phytonmk/nanointl/issues/new) or fork repository for pull requests.
