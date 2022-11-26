import { UnpluginInstance } from 'unplugin';
declare type UserOptions = {
    defaultLocale: string;
    localesDir: string;
};
export declare const unplugin: UnpluginInstance<UserOptions, false>;
export declare const nanointlVitePlugin: UnpluginInstance<UserOptions, false>['vite'];
export declare const nanointlRollupPlugin: UnpluginInstance<UserOptions, false>['rollup'];
export declare const nanointlWebpackPlugin: UnpluginInstance<UserOptions, false>['webpack'];
export declare const nanointlEsbuildPlugin: UnpluginInstance<UserOptions, false>['esbuild'];
export {};
