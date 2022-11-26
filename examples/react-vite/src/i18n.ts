import { makeReactIntl } from '../../../packages/nanointl-react/src/nanointl-react';
import type messagesTypeBase from './locales/en.json';
import { initLocale, initMessages, loadMessages } from '@nanointl/unplugin/runtime';
import { numberPlugin } from '../../../src/number';
import { dateTimePlugin } from '../../../src/datetime';
import { tagsPlugin } from '../../../src/tags';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl(
  initLocale,
  initMessages as typeof messagesTypeBase,
  {
    plugins: [numberPlugin, dateTimePlugin, tagsPlugin],
    loadMessages,
  },
);
