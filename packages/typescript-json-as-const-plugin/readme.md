# `typescript-json-as-const-plugin`

Plugin changes the way how typescript inferencing JSON files typings to `as const` behavior. It is part of [nanointl project](http://github.com/phytonmk/nanointl) but may be used apart.

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
+      { "name": "typescript-json-as-const-plugin", "include": ["./src/locales"] },
      ...
    ]
  },
  ...
}

```

2. (VS Code only) [switch to workspace version of Typescript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)

3. Restart typescript server.
