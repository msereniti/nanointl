import { makeSvelteIntl } from '@nanointl/svelte';
import type messagesTypeBase from '../locales/en.json';
import { initLocale, initMessages, loadMessages } from '@nanointl/unplugin/runtime';
import { tagsPlugin } from 'nanointl/tags';

export const { t, availableLocales, loadLocale, setLocale } = makeSvelteIntl(
  initLocale,
  initMessages as typeof messagesTypeBase,
  {
    plugins: [tagsPlugin],
    loadMessages,
  },
);
