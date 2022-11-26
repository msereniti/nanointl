export declare const initLocale: string;
export declare const initMessages: { [messageId: string]: string };
export declare const loadMessages: { [localeName: string]: () => Promise<{ [messageId: string]: string }> };

declare module '@nanointl/unplugin/runtime' {
  export const initLocale: string;
  export const initMessages: { [messageId: string]: string };
  export const loadMessages: { [localeName: string]: () => Promise<{ [messageId: string]: string }> };
}
