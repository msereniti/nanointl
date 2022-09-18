export type IntlBase = {
  locale: string;
  pluralRulesCardinal: Intl.PluralRules;
  pluralRulesOrdinal: Intl.PluralRules;
  makeDateTimeFormat: (options: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat;
};
export const makeIntlBase = (locale: string): IntlBase => ({
  locale,
  pluralRulesCardinal: new Intl.PluralRules(locale, { type: 'cardinal' }),
  pluralRulesOrdinal: new Intl.PluralRules(locale, { type: 'ordinal' }),
  makeDateTimeFormat: (options) => new Intl.DateTimeFormat(locale, options),
});
