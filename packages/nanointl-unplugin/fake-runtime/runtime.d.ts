export declare const initLocale: string;
export declare const initMessages: { [messageId: string]: string };
export declare const loadMessages: { [localeName: string]: () => Promise<{ [messageId: string]: string }> };
