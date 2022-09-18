import { makeReactIntl } from '../../../packages/nanointl-react/src/nanointl-react';
import enMessages from './locales/en.json';

export const { IntlProvider, useTranslation, useIntlControls } = makeReactIntl('en', enMessages);
