# `typescript-json-as-const-plugin`

Plugin changes the way how typescript inferencing JSON files typings to `as const` behavior. It is part of [nanointl project](http://github.com/phytonmk/nanointl) but may be used apart.

```ts
// how json import looks without plugin
import obj from './obj.json';
// { key1: string, key2: { key3: number } }

// how json import looks with plugin
import obj from './obj.json';
// { key1: "Hello world", key2: { key3: 3 } }
```

## Installation

```
pnpm add -D typescript-json-as-const-plugin
# or: npm install --save-dev typescript-json-as-const-plugin
```

## Usage

1. Add plugin to your `tsconfig.json`

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

2. ([VS Code](https://code.visualstudio.com) only) [switch to workspace version of Typescript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)

3. Restart typescript server.
   1. [tsc cli](https://www.npmjs.com/package/typescript) – kill process and restart it.
   2. [VS Code](https://code.visualstudio.com) – while any .ts file is opened, press ⌘/cmd+shift+p to open command palette and type to find command "TypeScript: restart TS server"
