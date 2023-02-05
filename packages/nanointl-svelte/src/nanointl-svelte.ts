// @ts-ignore
import { MakeIntlOptions, FormatMessage, makeIntl } from 'nanointl';
import { writable, get } from 'svelte/store';

type NanointlSvelteOptions = MakeIntlOptions & {
  loadMessages?: { [localeName: string]: () => Promise<{ [messageId: string]: string }> };
};

export const makeSvelteIntl = <
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
>(
  defaultLocale: string,
  defaultLocaleMessages: Messages,
  options: NanointlSvelteOptions = {},
) => {
  const { loadMessages, ...nanointlOptions } = options;

  const intlContainer = { [defaultLocale]: makeIntl(defaultLocale, defaultLocaleMessages, nanointlOptions) };
  const currentLocale = writable(defaultLocale);
  const availableLocales = writable(new Set([defaultLocale]));

  const t = writable<FM>(intlContainer[defaultLocale].formatMessage as any);
  const addLocale = (locale: string, messages: Messages) => {
    intlContainer[locale] = makeIntl(locale, messages, nanointlOptions);
    availableLocales.update((locales) => locales.add(locale));
  };
  const setLocale = (locale: string) => {
    if (!intlContainer[locale]) throw new Error(`Locale "${locale}" was not provided`);
    if (get(currentLocale) !== locale) {
      currentLocale.set(locale);
      t.set(intlContainer[locale].formatMessage as any);
    }
  };
  const loadLocale = async (locale: string) => {
    if (!loadMessages) return;
    const messages = await loadMessages[locale]?.();
    addLocale(locale, messages as any);
  };
  const deleteLocale = (locale: string) => {
    if (get(currentLocale) === locale) {
      const otherLocales = Object.keys(intlContainer).filter((locale) => locale !== get(currentLocale) && intlContainer[locale]);
      if (otherLocales.length === 0) throw `Unable to delete last left locale`;
      if (locale !== defaultLocale && intlContainer[defaultLocale]) {
        setLocale(defaultLocale);
      } else {
        setLocale(otherLocales[0]);
      }
    }
    availableLocales.update((locales) => {
      locales.delete(locale);
      return locales;
    });
    delete intlContainer[locale];
  };

  return {
    t,
    currentLocale,
    availableLocales,
    addLocale,
    setLocale,
    loadLocale,
    deleteLocale,
  };
};
