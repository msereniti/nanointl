import React from 'react';
import { MakeIntlOptions, FormatMessage, makeIntl, IntlInstance } from '../../../src/makeIntl';

type IntlControls<Messages extends { [messageId: string]: string }> = {
  addLocale: (locale: string, messages: Messages) => void;
  setLocale: (locale: string) => void;
  deleteLocale: (locale: string) => void;
  getAvailableLocales: () => string[];
  loadLocale: (locale: string) => Promise<void>;
  getCurrentLocale: () => string;
};

type Context = { intl: IntlInstance<any>; controls: IntlControls<any> };
const context = React.createContext<Context | null>(null);

const noContextError = `You need to wrap your app into <IntlProvider />`;
const multipleProvidersError = `You can use only one instance of IntlProvider from makeReactIntl() returned value`;
const lastLocaleError = `Unable to delete last left locale`;

type NanointlReactOptions = MakeIntlOptions & {
  loadMessages?: { [localeName: string]: () => Promise<{ [messageId: string]: string }> };
};

export const makeReactIntl = <
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
>(
  defaultLocale: string,
  defaultLocaleMessages: Messages,
  options: NanointlReactOptions = {},
) => {
  const { loadMessages, ...nanointlOptions } = options;
  const intlContainer = { [defaultLocale]: makeIntl(defaultLocale, defaultLocaleMessages, nanointlOptions) };
  let proviedLocaleListener: null | ((locale: string) => void) = null;
  let currentLocale = defaultLocale;

  const addLocale = (locale: string, messages: Messages) => {
    intlContainer[locale] = makeIntl(locale, messages, nanointlOptions);
  };
  const setLocale = (locale: string) => {
    if (!intlContainer[locale]) throw new Error(`Locale "${locale}" was not provided`);
    if (currentLocale !== locale) {
      currentLocale = locale;
      proviedLocaleListener?.(locale);
    }
  };
  const getAvailableLocales = () => [...new Set([...Object.keys(intlContainer), ...Object.keys(loadMessages || {})])];
  const loadLocale = async (locale: string) => {
    if (!loadMessages) return;
    const messages = await loadMessages[locale]?.();
    intlContainer[locale] = makeIntl(locale, messages, nanointlOptions);
  };
  const deleteLocale = (locale: string) => {
    if (locale === currentLocale) {
      const otherLocales = Object.keys(intlContainer).filter((locale) => locale !== currentLocale && intlContainer[locale]);
      if (otherLocales.length === 0) throw lastLocaleError;
      if (locale !== defaultLocale && intlContainer[defaultLocale]) {
        setLocale(defaultLocale);
      } else {
        setLocale(otherLocales[0]);
      }
    }
    delete intlContainer[locale];
  };
  const getCurrentLocale = () => currentLocale;

  const controls: IntlControls<Messages> = {
    addLocale,
    setLocale,
    deleteLocale,
    getAvailableLocales,
    loadLocale,
    getCurrentLocale,
  };
  const IntlProvider: React.FC<{ children: React.ReactNode; locale?: string }> = ({ children, locale }) => {
    const [intl, setIntl] = React.useState(intlContainer[defaultLocale]);
    React.useEffect(() => {
      if (!locale) return;
      setLocale(locale);
      setIntl(intlContainer[locale]);
    }, [locale]);
    React.useEffect(() => {
      if (proviedLocaleListener) throw new Error(multipleProvidersError);
      proviedLocaleListener = (locale) => {
        setLocale(locale);
        setIntl(intlContainer[locale]);
      };
      return () => {
        proviedLocaleListener = null;
      };
    }, []);
    const ctx = React.useMemo(() => ({ intl, controls }), [intl, controls]);
    return <context.Provider value={ctx}>{children}</context.Provider>;
  };
  const useIntlControls = (): IntlControls<Messages> => {
    const ctx = React.useContext(context);
    if (ctx === null) throw new Error(noContextError);
    return ctx.controls;
  };
  const useTranslation = () => {
    const ctx = React.useContext(context);
    if (ctx === null) throw new Error(noContextError);
    return ctx.intl.formatMessage as FM;
  };

  return {
    IntlProvider,
    controls,
    useIntlControls,
    useTranslation,
  };
};
