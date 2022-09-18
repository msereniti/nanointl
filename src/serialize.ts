import { IntlBase } from './intlBase';
import { AstNode } from './parse';

export type ExternalSerializer<Params = unknown> = (params: Params | null, variableValue: unknown, intl: IntlBase) => string;
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
const defaultReducer: Reducer<string> = {
  getInit: () => '',
  reduce: (acc, item) => acc + String(item),
};

export const serializeIcu = <T = string>(
  ast: AstNode[],
  values: Record<string, string | number | boolean | undefined | unknown>,
  intl: IntlBase,
  options?: {
    externalSerializers?: ExternalSerializers;
    reducer?: Reducer<T>;
    original?: string;
  },
): T => {
  const reducer = options?.reducer ?? (defaultReducer as any as Reducer<T>);
  let result = reducer.getInit();
  for (const node of ast) {
    if (typeof node === 'string') {
      result = reducer.reduce(result, node, 'string');
    } else if (typeof node === 'object' && node !== null) {
      if (node.type === 'variable') {
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
        const serialized = options.externalSerializers?.[node.name](node.data, values[node.variableName], intl);
        result = reducer.reduce(result, serialized, 'external');
      } else {
        result = reducer.reduce(result, node, 'unknown');
      }
    }
  }
  return result;
};

export type PreSerializer<InputAst extends AstNode[], OutputAst extends AstNode[]> = (inputAst: InputAst) => OutputAst;
