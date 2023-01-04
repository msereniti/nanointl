import { IntlBase } from './intlBase';
import { AstNode } from './parse';

export type ExternalSerializer<Params = unknown> = (
  params: Params | null,
  variableValue: unknown,
  intl: IntlBase,
  serializeNested: (ast: AstNode[]) => unknown,
  node: AstNode,
  values: Record<string, string | number | boolean | undefined | unknown>,
) => string;
export type ExternalSerializers<Params = unknown> = {
  [serializerName: string]: ExternalSerializer<Params>;
};

export type VerboseSerialization = {
  [variableName: string]: unknown;
};

type Reducer<T> = {
  getInit: () => T;
  reduce: (acc: T, item: unknown, nodeType: 'string' | 'variable' | 'plural' | 'select' | 'external' | 'unknown') => T;
};
const defaultReducer: Reducer<string | (string | unknown)[]> = {
  getInit: () => '',
  reduce: (acc, item) => {
    if (typeof item !== 'object') {
      if (Array.isArray(acc)) {
        if (typeof acc[acc.length - 1] !== 'object') acc[acc.length - 1] += String(item);
        else acc.push(String(item));
      } else {
        acc += String(item);
      }
    } else {
      if (Array.isArray(acc)) acc.push(item);
      else if (acc === '') return [item];
      else return [acc, item];
    }
    return acc;
  },
};

export type SerializeIcuOptions = {
  externalSerializers?: ExternalSerializers;
  reducer?: Reducer<any>;
  original?: string;
};

export const serializeIcu = <T = string>(
  ast: AstNode[],
  values: Record<string, string | number | boolean | undefined | unknown>,
  intl: IntlBase,
  options?: SerializeIcuOptions,
): T => {
  const serializeNested = (ast: AstNode[]) => serializeIcu(ast, values, intl, options);
  const reducer = options?.reducer ?? (defaultReducer as any as Reducer<T>);
  let result = reducer.getInit();
  for (const node of ast) {
    if (typeof node === 'string') {
      result = reducer.reduce(result, node, 'string');
    } else if (typeof node === 'object' && node !== null) {
      if (node.type === 'pure-text') {
        result = reducer.reduce(result, node.text, 'string');
      } else if (node.type === 'variable') {
        if (!values || !(node.name in values)) {
          throw new Error(`Variable "${node.name}" was not provided for string "${options?.original}"`);
        }
        let value = values[node.name as keyof typeof values];
        if (typeof value === 'number' && node.offset) value -= node.offset.value;
        if (value !== false && value !== null && value !== undefined) {
          result = reducer.reduce(result, value, 'variable');
        }
      } else if (node.type === 'plural') {
        const value = values?.[node.variable.name as keyof typeof values];
        const exactRule = node.options.exacts?.[value as keyof typeof node.options.exacts];
        let nestedAst = value;
        if (exactRule) {
          nestedAst = exactRule;
        } else {
          const finalValue = (value as number) - (node.offset?.value ?? 0);
          const pluralBase = node.cardinal ? intl.pluralRulesCardinal : intl.pluralRulesOrdinal;
          const selected = pluralBase.select(finalValue);
          nestedAst = node.options[selected] ?? node.options.other;
        }
        if (Array.isArray(nestedAst)) {
          result = reducer.reduce(result, serializeIcu(nestedAst, values, intl, options), 'plural');
        } else {
          result = reducer.reduce(result, nestedAst, 'plural');
        }
      } else if (node.type === 'select') {
        const value = values?.[node.variable.name as keyof typeof values];
        const nestedAst = node.options[value as keyof typeof node.options] ?? node.options.other ?? String(value);
        result = reducer.reduce(result, serializeIcu(nestedAst, values, intl, options), 'select');
      } else if (node.type === 'external') {
        const value = values[node.variableName];
        if (!options?.externalSerializers?.[node.name]) {
          if (!node.optionsPart && node.name === 'number') {
            result = reducer.reduce(result, new Intl.NumberFormat(intl.locale).format(value as number), 'external');
            continue;
          }
          throw new Error(`No serializer provided for type ${node.name}`);
        }
        const subResult = options.externalSerializers?.[node.name](
          node.data,
          values[node.variableName],
          intl,
          serializeNested,
          node,
          values,
        );
        if (Array.isArray(subResult)) {
          for (const chunk of subResult) {
            result = reducer.reduce(result, chunk, 'external');
          }
        } else {
          result = reducer.reduce(result, subResult, 'external');
        }
      } else {
        result = reducer.reduce(result, node, 'unknown');
      }
    }
  }
  return result;
};

export type PreSerializer<InputAst extends AstNode[], OutputAst extends AstNode[]> = (inputAst: InputAst) => OutputAst;
