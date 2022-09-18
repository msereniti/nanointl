import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { IntlProvider } from './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <IntlProvider>
      <App />
    </IntlProvider>
  </React.StrictMode>,
);
