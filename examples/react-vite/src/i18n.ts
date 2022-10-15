import { makeReactIntl } from '../../../packages/nanointl-react/src/nanointl-react';
import enMessages from './locales/en.json';
import { numberPlugin } from '../../../src/number';
import { dateTimePlugin } from '../../../src/datetime';
import { markdownPlugin } from '../../../src/markdown';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages, {
  plugins: [numberPlugin, dateTimePlugin, markdownPlugin],
});
