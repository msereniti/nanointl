import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import { useTranslation } from './i18n';

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
            code: ({ children }) => {
              return <code>{children}</code>;
            },
          })}
        </p>
      </div>
      <p className="read-the-docs">{t('readTheDocs')}</p>
    </div>
  );
};
