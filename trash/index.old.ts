/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Function compatible with `generateNumFmtPattern` from `@formatjs/ecma376`
 */
export const generateNumFmtPattern = (locales: string | string[], opts: Intl.NumberFormatOptions): string => {};
/**
 * https://tc39.es/ecma402/#sec-partitionpattern
 *
 * Function compatible with `PartitionPattern` from `@formatjs/ecma402-abstract`
 */
export const PartitionPatternn = <T extends string>(pattern: string): Array<{ type: T; value: string | undefined }> => {};
/**
 * Class compatible with `Parser` from `@formatjs/icu-messageformat-parser`
 */
export class Parser {}
/**
 * Returns the best matching date time pattern if a date time skeleton
 * pattern is provided with a locale. Follows the Unicode specification:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#table-mapping-requested-time-skeletons-to-patterns
 * @param skeleton date time skeleton pattern that possibly includes j, J or C
 * @param locale
 *
 * Function compatible with `getBestPattern` from `@formatjs/icu-messageformat-parser`
 */
export const getBestPattern = (skeleton: string, locale: Intl.Locale): string => {};
/**
 * Function compatible with `parse` from `@formatjs/icu-messageformat-parser`
 */
export const parse = (message: string, opts: ParserOptions = {}): MessageFormatElement => {};
/**
 * Hoist all selectors to the beginning of the AST & flatten the
 * resulting options. E.g:
 * "I have {count, plural, one{a dog} other{many dogs}}"
 * becomes "{count, plural, one{I have a dog} other{I have many dogs}}".
 * If there are multiple selectors, the order of which one is hoisted 1st
 * is non-deterministic.
 * The goal is to provide as many full sentences as possible since fragmented
 * sentences are not translator-friendly
 *
 * Function compatible with `parse` from `@formatjs/icu-messageformat-parser`
 */
export const hoistSelectors = (ast: MessageFormatElement[]): MessageFormatElement[] => {};
/**
 * Function compatible with `printAST` from `@formatjs/icu-messageformat-parser`
 */
export const printAST = (ast: MessageFormatElement[]): string => {};
export const parseDateTimeSkeleton = () => {};
export const parseNumberSkeleton = () => {};
export const parseNumberSkeletonFromString = () => {};
export const createIntl = () => {};
export const MissingTranslationError = () => {};
export const formatDate = () => {};
export type IntlConfig = () => {};
export type IntlFormatters = () => {};
export const formatList = () => {};
export const IntlMessageFormat = () => {};
export const formatMessage = () => {};
export type Formatters = () => {};
export const formatNumber = () => {};
export const formatPlural = () => {};
export const formatRelativeTime = () => {};
export const DateTimeFormat = () => {};
export const formatTime = () => {};
export const bestFitFormatMatcherScore = () => {};
export const BestFitFormatMatcher = () => {};
export const processDateTimePattern = () => {};
export const splitRangePattern = () => {};
export const toLocaleString = () => {};
export const toLocaleDateString = () => {};
export const toLocaleTimeString = () => {};
export const IntlDateTimeFormatPart = () => {};
export const DisplayNames = () => {};
export const _shouldPolyfillWithoutLocale = () => {};
export const supportedValuesOf = () => {};
export const getCanonicalLocales = () => {};
export const parseUnicodeLocaleId = () => {};
export const ListFormat = () => {};
export const Locale = () => {};
export const BestFitMatcher = () => {};
export const match = () => {};
export const LookupMatcher = () => {};
export const ResolveLocale = () => {};
export const PART_TYPE = () => {};
export const NumberFormat = () => {};
export const NumberFormatOptions = () => {};
export const _formatToParts = () => {};
export const PluralRules = () => {};
export const RelativeTimeFormat = () => {};
export const formatDisplayName = () => {};
