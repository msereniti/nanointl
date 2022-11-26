import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import { useIntlControls, useTranslation } from './i18n';

const LocaleControl: React.FC = () => {
  const { getAvailableLocales, getCurrentLocale, loadLocale, setLocale } = useIntlControls();
  const locales = React.useMemo(getAvailableLocales, [getAvailableLocales]);
  const handleLocaleChange = React.useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = event.target.value;
    await loadLocale(locale);
    setLocale(locale);
  }, []);

  return (
    <select value={getCurrentLocale()} onChange={handleLocaleChange}>
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </select>
  );
};

export const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const t = useTranslation();

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt={t('viteLogo')} />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt={t('reactLogo')} />
        </a>
      </div>
      <h1>{t('title')}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>{t('counter', { count })}</button>
        <p>
          {t('description', {
            filePath: 'src/App.tsx',
            code: ({ children }) => <code key="code">{children}</code>,
          })}
        </p>
      </div>
      <div>
        <LocaleControl />
      </div>
      <p className="read-the-docs">
        {t('readTheDocs', {
          b: ({ children }) => <b key={children}>{children}</b>,
        })}
      </p>
    </div>
  );
};
