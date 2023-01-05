import { NanointlPlugin } from './makeIntl';
import { ExternalParser } from './parse';
import { ExternalSerializer } from './serialize';
import type { TopLevelBracketsGroup, OptionalSpacingSymbolSequence } from './typings';

export type NumberSerializationParams = {
  native: Intl.NumberFormatOptions;
  scale: number;
  offset: number;
  percent?: boolean;
  verbose?: boolean;
};

export const parseNumber: ExternalParser<NumberSerializationParams> = (template, variableName, verboseInput) => {
  if (template.trim() === 'verbose') return { native: verboseInput, scale: 1, offset: 0, verbose: true };
  if (template.trim() === 'integer')
    return { native: { minimumFractionDigits: 0, maximumFractionDigits: 0 }, scale: 1, offset: 0 };
  if (!template.trimStart().startsWith('::')) return { native: {}, scale: 1, offset: 0 };
  const tokens = template.split('::')[1].split(' ').filter(Boolean);
  const params: NumberSerializationParams = { native: {}, scale: 1, offset: 0 };
  for (const token of tokens) {
    if (token === '%' || token === 'percent' || token.startsWith('%x')) {
      params.native.unitDisplay = params.native.unitDisplay ?? 'short';
      params.native.style = 'unit';
      params.native.unit = 'percent';
      params.native.maximumFractionDigits = params.native.maximumFractionDigits ?? 0;
      params.scale *= 100;
      if (token.startsWith('%x')) params.scale *= parseFloat(token.substring('%x'.length));
    } else if (token.startsWith('.')) {
      const startChar = token[1];
      for (let i = 1; i < token.length; i++) {
        const char = token[i];
        if (char === '0') {
          params.native.minimumFractionDigits = i;
          if (startChar === char) params.native.maximumFractionDigits = i;
        } else if (char === '#') params.native.maximumFractionDigits = i;
        else if (char === '*') params.native.maximumFractionDigits = 20;
        else throw new Error(`Unexpected symbol "${char}" in "${template}" template of "${variableName}" interpolation`);
      }
    } else if (token.startsWith('/')) {
      const startChar = token[1];
      for (let i = 1; i < token.length; i++) {
        const char = token[i];
        if (char === '@') {
          params.native.minimumSignificantDigits = i;
          if (startChar === char) params.native.maximumSignificantDigits = i;
        } else if (char === '#') params.native.maximumSignificantDigits = i;
        else if (char === '*') params.native.maximumSignificantDigits = 20;
        else throw new Error(`Unexpected symbol "${char}" in "${template}" template of "${variableName}" interpolation`);
      }
    } else if (token.startsWith('integer-width')) {
      params.native.minimumFractionDigits = 0;
      params.native.maximumFractionDigits = 0;
      if (token.startsWith('integer-width/')) {
        const options = token.substring('integer-width'.length);
        const startChar = options[1];
        for (let i = 1; i < options.length; i++) {
          const char = options[i];
          if (char === '#' && params.native.minimumIntegerDigits === undefined) {
            params.native.minimumIntegerDigits = i;
          }
          if (char === '0') {
            if (startChar === '*' || startChar === '0') params.native.minimumIntegerDigits = i;
            if (startChar === '#' || startChar === '0') params.native.maximumSignificantDigits = i;
          }
        }
      }
    } else if (token.startsWith('E') || token.startsWith('engineering') || token.startsWith('scientific')) {
      if (token.startsWith('EE') || token.startsWith('engineering')) {
        params.native.notation = 'engineering';
      } else {
        params.native.notation = 'scientific';
      }
      if (token.startsWith('E')) {
        const rest = token.startsWith('EE') ? token.substring('EE'.length) : token.substring('E'.length);
        if (rest.startsWith('+!')) params.native.signDisplay = 'always';
        if (rest.startsWith('+?')) params.native.signDisplay = 'exceptZero';
        let zeroCharsCount = 0;
        for (let i = 0; i < rest.length; i++) if (rest[i] === '0') zeroCharsCount++;
        params.native.minimumIntegerDigits = zeroCharsCount;
      } else {
        const parts = token.split('/');
        for (const part of parts) {
          if (part === 'sign-always') params.native.signDisplay = 'always';
          if (part === 'except-zero') params.native.signDisplay = 'exceptZero';
          if (part.startsWith('*')) params.native.minimumIntegerDigits = part.length - 1;
        }
      }
    } else if (token.startsWith('scale/')) params.scale *= parseFloat(token.substring('scale/'.length));
    else if (token.startsWith('measure-unit/')) {
      params.native.style = 'unit';
      params.native.unit = token.substring('measure-unit/'.length);
    } else if (token.startsWith('unit/')) {
      params.native.style = 'unit';
      params.native.unit = token.substring('unit/'.length);
    } else if (token.startsWith('currency/')) {
      params.native.style = 'currency';
      params.native.currency = token.substring('currency/'.length);
    } else if (token === 'notation-scientific') params.native.notation = 'scientific';
    else if (token === 'notation-engineering') params.native.notation = 'engineering';
    else if (token === 'notation-simple') params.native.notation = 'standard';
    else if (token === 'unit-width-iso-code') params.native.currencyDisplay = 'symbol';
    else if (token === 'unit-width-short') {
      params.native.unitDisplay = 'short';
      params.native.currencyDisplay = 'code';
    } else if (token === 'unit-width-full-name') {
      params.native.unitDisplay = 'long';
      params.native.currencyDisplay = 'name';
    } else if (token === 'unit-width-narrow') {
      params.native.unitDisplay = 'narrow';
      params.native.currencyDisplay = 'narrowSymbol';
    } else if (token === 'compact-short' || token === 'K') {
      params.native.notation = 'compact';
      params.native.compactDisplay = 'short';
    } else if (token === 'compact-long' || token === 'KK') {
      params.native.notation = 'compact';
      params.native.compactDisplay = 'long';
    } else if (token === 'sign-auto') params.native.signDisplay = 'auto';
    else if (token === 'sign-always' || token === '+!') params.native.signDisplay = 'always';
    else if (token === 'sign-never' || token === '+_') params.native.signDisplay = 'never';
    else if (token === 'sign-except-zero' || token === '+?') params.native.signDisplay = 'exceptZero';
    else if (token === 'sign-accounting' || token === '()') {
      params.native.currencySign = 'accounting';
    } else if (token === 'sign-accounting' || token === 'sign-accounting-always' || token === '()!') {
      params.native.signDisplay = 'always';
      params.native.currencySign = 'accounting';
    } else if (token === 'sign-accounting-except-zero' || token === '()?') {
      params.native.signDisplay = 'exceptZero';
      params.native.currencySign = 'accounting';
    } else if (token === 'group-always') params.native.useGrouping = 'always' as any;
    else if (token === 'group-auto') params.native.useGrouping = 'auto' as any;
    else if (token === 'group-off' || token === ',_') params.native.useGrouping = false;
    else if (token === 'group-min-2' || token === ',?') params.native.useGrouping = 'min2' as any;
    else throw new Error(`Unexpected token "${token}" in "${template}" template of "${variableName}" interpolation`);
  }

  return params;
};

const multiply = (a: number | bigint, b: number) => (typeof a === 'number' ? a * b : a * BigInt(b));
const subtract = (a: number | bigint, b: number) => (typeof a === 'number' ? a - b : a - BigInt(b));
export const serializeNumber: ExternalSerializer<NumberSerializationParams> = (params, variableValue) => {
  const numberFormat = new Intl.NumberFormat('en-US', params?.native ?? {});
  let value = ['number', 'bigint'].includes(typeof variableValue)
    ? (variableValue as number | bigint)
    : parseFloat(String(variableValue));
  if (params && typeof params.scale === 'number' && params.scale !== 1) value = multiply(value, params.scale);
  if (params && typeof params.offset === 'number' && params.offset !== 0) value = subtract(value, params.offset);
  return numberFormat.format(value);
};

export const numberPlugin: NanointlPlugin<NumberSerializationParams> = {
  name: 'number-plugin',
  init(options) {
    options.addParser('number', parseNumber);
    options.addSerializer('number', serializeNumber);
  },
};

type NumberParser<Template extends string> =
  TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}number}`
    ? {
        vars: [{ name: SelectVariable; type: number }];
      }
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}number,${infer NumberOptions}}`
    ? {
        vars: [{ name: SelectVariable; type: number }];
      }
    : { vars: [] };

declare global {
  interface NanointlBracketsParsers<Template extends string> {
    number: NumberParser<Template>;
  }
}
