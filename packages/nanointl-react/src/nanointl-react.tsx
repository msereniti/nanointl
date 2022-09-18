import React from 'react';
import { MakeIntlOptions, FormatMessage, makeIntl, IntlInstance } from '../../../src/makeIntl';

type IntlControls<Messages extends { [messageId: string]: string }> = {
  addLocale: (locale: string, messages: Messages) => void;
  setLocale: (locale: string) => void;
  deleteLocale: (locale: string) => void;
};

const IntlContext = React.createContext<{ intl: IntlInstance<any>; controls: IntlControls<any> } | null>(null);

const noContextError = `You need to wrap your app into <IntlProvider />`;
const multipleProvidersError = `You can use only one instance of IntlProvider from makeReactIntl() returned value`;
const lastLocaleError = `Unable to delete last left locale`;

export const makeReactIntl = <
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
>(
  defaultLocale: string,
  defaultLocaleMessages: Messages,
  options?: MakeIntlOptions,
) => {
  const intlContainer = { [defaultLocale]: makeIntl(defaultLocale, defaultLocaleMessages, options) };
  let proviedLocaleListener: null | ((locale: string) => void) = null;
  let currentLocale = defaultLocale;

  const addLocale = (locale: string, messages: Messages) => {
    intlContainer[locale] = makeIntl(locale, messages, options);
  };
  const setLocale = (locale: string) => {
    if (!intlContainer[locale]) throw new Error(`Locale "${locale}" was not provided`);
    currentLocale = locale;
    proviedLocaleListener?.(locale);
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

  const controls: IntlControls<Messages> = { addLocale, setLocale, deleteLocale };
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
    return <IntlContext.Provider value={ctx}>{children}</IntlContext.Provider>;
  };
  const useIntlControls = (): IntlControls<Messages> => {
    const ctx = React.useContext(IntlContext);
    if (ctx === null) throw new Error(noContextError);
    return ctx.controls;
  };
  const useTranslation = () => {
    const ctx = React.useContext(IntlContext);
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
