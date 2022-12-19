import { makeReactIntl } from '@nanointl/react/src/nanointl-react';
import type messagesTypeBase from './locales/en.json';
import { initLocale, initMessages, loadMessages } from '@nanointl/unplugin/runtime';
import { tagsPlugin } from 'nanointl/tags';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl(
  initLocale,
  initMessages as typeof messagesTypeBase,
  {
    plugins: [tagsPlugin],
    loadMessages,
  },
);
