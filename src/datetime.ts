import { NanointlPlugin } from './makeIntl';
import { ExternalParser } from './parse';
import { ExternalSerializer } from './serialize';
import type { TopLevelBracketsGroup, OptionalSpacingSymbolSequence } from './typings';

type SkeletonPart =
  | 'G' //	Era designator
  | 'y' //	year
  | 'Y' //	year of “Week of Year”
  | 'u' //	extended year
  | 'U' //	cyclic year name, as in Chinese lunar calendar
  | 'r' //	related Gregorian year
  | 'Q' //	related Gregorian year
  | 'q' //	related Gregorian year
  | 'M' //	month in year
  | 'L' //	stand-alone month in year
  | 'w' //	week of year
  | 'W' //	week of month
  | 'd' //	day in month
  | 'D' //	day of year
  | 'E' //	day of week
  | 'e' //	local day of week
  | 'c' //	stand-alone local day of week
  | 'a' //	AM/PM marker
  | 'j' //	Hour
  | 'h' //	Hour [1-12]
  | 'H' //	Hour [0-23]
  | 'K' //	Hour [0-11]
  | 'k' //	Hour [1-24]
  | 'm' //	Minute
  | 's' //	Second
  | 'z'; //	Time Zone
const skeletonChartsMap: { [Char in SkeletonPart]: true } = {
  G: true,
  y: true,
  Y: true,
  u: true,
  U: true,
  r: true,
  Q: true,
  q: true,
  M: true,
  L: true,
  w: true,
  W: true,
  d: true,
  D: true,
  E: true,
  e: true,
  c: true,
  a: true,
  j: true,
  h: true,
  H: true,
  K: true,
  k: true,
  m: true,
  s: true,
  z: true,
};
type Display = 'short' | 'medium' | 'long' | 'full';

export type DateTimeSerializationParams = Intl.DateTimeFormatOptions;

export const parseDateTime: ExternalParser<DateTimeSerializationParams> = (template, variableName, verboseInput) => {
  if (template.trim() === 'verbose') return verboseInput;
  if (!template.trim().startsWith('::')) {
    const display: Intl.DateTimeFormatOptions['timeStyle'] = ['short', 'medium', 'long', 'full'].includes(
      template.trim().toLowerCase(),
    )
      ? (template.trim().toLowerCase() as Display)
      : 'medium';

    return {
      dateStyle: display,
      timeStyle: display,
    };
  } else {
    const skeleton = template.split('::')[1].trim();
    const parts: (
      | string
      | {
          partName: SkeletonPart;
          size: number;
        }
    )[] = [];
    let lastChar: string | null = null;
    let lastPart: typeof parts[0] | null = null;
    for (let i = 0; i < skeleton.length; i++) {
      const char = skeleton[i];
      if (!(char in skeletonChartsMap)) {
        if (typeof lastPart === 'string') {
          lastPart += char;
        } else if (lastPart === null) {
          lastPart = char;
        } else {
          if (lastPart) parts.push(lastPart);
          lastPart = char;
        }
      } else {
        if (typeof lastPart === 'string') {
          parts.push(lastPart);
        }
        if (typeof lastPart === 'string' || lastPart === null) {
          lastPart = { partName: char as SkeletonPart, size: 1 };
        } else if (lastChar === char) {
          lastPart.size++;
        } else if (lastChar !== char) {
          parts.push(lastPart);
          lastPart = { partName: char as SkeletonPart, size: 1 };
        }
      }
      lastChar = char;
    }
    if (lastPart !== null) {
      parts.push(lastPart);
    }
    const result: Intl.DateTimeFormatOptions = {};
    for (const part of parts) {
      if (typeof part === 'string') continue;
      if (part.partName === 'G') {
        result.era = (['narrow', 'short', 'long'] as const)[part.size - 1];
      } else if (
        part.partName === 'y' ||
        part.partName === 'Y' ||
        part.partName === 'u' ||
        part.partName === 'U' ||
        part.partName === 'r'
      ) {
        result.year = ([undefined, '2-digit', undefined, 'numeric'] as const)[part.size - 1];
      } else if (part.partName === 'M' || part.partName === 'L') {
        result.month = (['numeric', '2-digit', 'short', 'long', 'narrow'] as const)[part.size - 1];
      } else if (part.partName === 'd') {
        result.day = (['numeric', '2-digit'] as const)[part.size - 1];
      } else if (part.partName === 'E' || part.partName === 'e' || part.partName === 'c') {
        result.weekday = (['narrow', 'short', 'long'] as const)[part.size - 1];
      } else if (part.partName === 'a') {
        result.hour12 = true;
      } else if (part.partName === 'h') {
        result.hour = (['numeric', '2-digit'] as const)[part.size - 1];
        result.hour12 = true;
      } else if (part.partName === 'H') {
        result.hour = (['numeric', '2-digit'] as const)[part.size - 1];
        result.hour12 = false;
      } else if (part.partName === 'j') {
        result.hour = (['numeric', '2-digit'] as const)[part.size - 1];
        result.hour12 = undefined;
      } else if (part.partName === 'K') {
        result.hour = (['numeric', '2-digit'] as const)[part.size - 1];
        result.hour12 = true;
      } else if (part.partName === 'k') {
        result.hour = (['numeric', '2-digit'] as const)[part.size - 1];
      } else if (part.partName === 'm') {
        result.minute = (['numeric', '2-digit'] as const)[part.size - 1];
      } else if (part.partName === 's') {
        result.second = (['numeric', '2-digit'] as const)[part.size - 1];
      } else if (part.partName === 'z') {
        result.timeZoneName = (['short', 'shortGeneric', 'long', 'longGeneric'] as const)[part.size - 1];
      } else {
        throw new Error(
          `Token "${part.partName}" is not supported for template "${template}" of variable "${variableName}" interpolation`,
        );
      }
    }

    return result;
  }
};

const normalizeDate = (providedDate: unknown) => {
  if (typeof providedDate === 'number') return new Date(providedDate);
  if (typeof providedDate === 'string') return new Date(providedDate);
  if (typeof providedDate === 'object' && providedDate instanceof Date) return providedDate;

  return new Date('Invalid date');
};

export const serializeDate: ExternalSerializer<DateTimeSerializationParams> = (params, variableValue, intl) => {
  const date = normalizeDate(variableValue);
  const dateTimeFormat = intl.makeDateTimeFormat(params ?? { year: 'numeric', month: '2-digit', day: '2-digit' });

  return dateTimeFormat.format(date);
};

export const serializeTime: ExternalSerializer<DateTimeSerializationParams> = (params, variableValue, intl) => {
  const date = normalizeDate(variableValue);
  const dateTimeFormat = intl.makeDateTimeFormat(params ?? { timeStyle: 'medium' });

  return dateTimeFormat.format(date);
};

export const dateTimePlugin: NanointlPlugin<DateTimeSerializationParams> = {
  name: 'dateTime-plugin',
  init(options) {
    options.addParser('date', parseDateTime);
    options.addParser('time', parseDateTime);
    options.addSerializer('date', serializeDate);
    options.addSerializer('time', serializeTime);
  },
};

type DateOrTimeToken = 'date' | 'time';
type DateTimeParser<Template extends string> =
  TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}${DateOrTimeToken}}`
    ? SelectVariable extends `${string}{${string}`
      ? { vars: [] }
      : { vars: [{ name: SelectVariable; type: Date }] }
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}${DateOrTimeToken},${infer DateTimeOptions}}`
    ? { vars: [{ name: SelectVariable; type: Date }] }
    : { vars: [] };

declare global {
  interface NanointlParsers<Template extends string> {
    dateTime: DateTimeParser<Template>;
  }
}
