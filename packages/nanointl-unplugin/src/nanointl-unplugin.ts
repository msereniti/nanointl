import { createUnplugin, UnpluginInstance } from 'unplugin';
import fs from 'fs/promises';
import { resolve as resolvePath } from 'path';

type UserOptions = {
  defaultLocale: string;
  localesDir: string;
};

export const nanointlUnplugin: UnpluginInstance<UserOptions, false> = createUnplugin((options: UserOptions) => {
  if (!options.localesDir) {
    throw new Error(`[@nanointl/unplugin] "localesDir" is a required option`);
  }
  if (!options.defaultLocale) {
    throw new Error(`[@nanointl/unplugin] "defaultLocale" is a required option`);
  }
  return {
    name: '@nanointl/unplugin',
    resolveInclude(id: string) {
      return id === '@nanointl/unplugin/runtime';
    },
    resolveId(id) {
      if (id !== '@nanointl/unplugin/runtime') return undefined;
      return '@nanointl/unplugin/runtime';
    },
    loadInclude(id) {
      if (id.includes('@nanointl/unplugin/dist/runtime.mjs')) return true;
      if (id.includes('@nanointl/unplugin/dist/runtime.js')) return true;
      if (id.includes('/nanointl-unplugin/dist/runtime.mjs')) return true;
      if (id.includes('/nanointl-unplugin/dist/runtime.js')) return true;
      if (id.includes('@nanointl/unplugin/runtime')) return true;
      return false;
    },
    async load() {
      const initLocale = process.env.LOCALE ?? options.defaultLocale;
      const localesList = await fs.readdir(options.localesDir);
      if (!localesList.length) {
        this.error(`No locales was found in ${options.localesDir}`);
        return;
      }
      if (!localesList.includes(`${initLocale}.json`)) {
        this.error(`Locale ${initLocale} (was searching for "${`${initLocale}.json`}") was not found in ${options.localesDir}`);
        return;
      }
      for (const localeFileName of localesList) {
        this.addWatchFile(resolvePath(options.localesDir, localeFileName));
      }
      const initMessagesFilePath = resolvePath(options.localesDir, `${initLocale}.json`);
      const loadMessages = localesList.map((localeFileName) => {
        const localeName = localeFileName.split('.').slice(0, -1).join('.');
        const importPath = resolvePath(options.localesDir, localeFileName);

        return `[${JSON.stringify(localeName)}]: () => import(${JSON.stringify(importPath)}).then(x => x.default)`;
      });

      return `
        export const initLocale = ${JSON.stringify(initLocale)};
        import _initMessages from ${JSON.stringify(initMessagesFilePath)};
        export const initMessages = _initMessages;
        export const loadMessages = { ${loadMessages.join(', ')} };
      `;
    },
  };
});

export const nanointlVitePlugin: UnpluginInstance<UserOptions, false>['vite'] = unplugin.vite;
export const nanointlRollupPlugin: UnpluginInstance<UserOptions, false>['rollup'] = unplugin.rollup;
export const nanointlWebpackPlugin: UnpluginInstance<UserOptions, false>['webpack'] = unplugin.webpack;
export const nanointlEsbuildPlugin: UnpluginInstance<UserOptions, false>['esbuild'] = unplugin.esbuild;
