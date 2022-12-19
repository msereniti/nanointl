/* eslint-disable @typescript-eslint/no-unused-vars */
type ArrayPushAny<Arr extends any[]> = [...Arr, any];
type ArrayShiftAny<Arr extends any[]> = Arr extends [infer Shifted, ...infer Rest] ? Rest : [];
type ArrayPopAny<Arr extends any[]> = Arr extends [...infer Rest, infer Popped] ? Rest : [];
type ArrayOfLength<Length extends number, Arr extends any[] = []> = Arr['length'] extends 999
  ? []
  : Arr['length'] extends Length
  ? Arr
  : ArrayOfLength<Length, ArrayPushAny<Arr>>;
export type Increment<
  Value extends number,
  ArrayOfIncrementedLength = ArrayPushAny<ArrayOfLength<Value>>,
> = ArrayOfIncrementedLength extends any[]
  ? ArrayOfIncrementedLength['length'] extends number
    ? ArrayOfIncrementedLength['length']
    : Value
  : Value;
export type Decrement<
  Value extends number,
  ArrayOfDecrementedLength = ArrayPopAny<ArrayOfLength<Value>>,
> = ArrayOfDecrementedLength extends any[]
  ? ArrayOfDecrementedLength['length'] extends number
    ? ArrayOfDecrementedLength['length']
    : Value
  : Value;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type UnionToOvlds<U> = UnionToIntersection<U extends any ? (f: U) => void : never>;
type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
  ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
  : [T, ...A];
type UnionOfValuesOf<T> = T[keyof T];

type TraverseLevelBracketsGroup<
  Template extends string,
  Depth extends number = 0,
  NexusLength extends number = 0,
  Escaping extends boolean = false,
> = NexusLength extends LinkedSleeveNexusLimit
  ? { next: UnwrapLinkedSleeve<TraverseLevelBracketsGroup<Template, Depth, 0, Escaping>> }
  : Template extends `${infer Char}${infer Rest}`
  ? Escaping extends false
    ? Char extends "'"
      ? TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, true>
      : Char extends '{'
      ? [Char, TraverseLevelBracketsGroup<Rest, Increment<Depth>, Increment<NexusLength>, Escaping>]
      : Char extends '}'
      ? Depth extends 1
        ? ['}']
        : [Char, TraverseLevelBracketsGroup<Rest, Decrement<Depth>, Increment<NexusLength>, Escaping>]
      : Depth extends 0
      ? TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, Escaping>
      : [Char, TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, Escaping>]
    : Char extends `${'{' | '}'}`
    ? Depth extends 0
      ? TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, Escaping>
      : [Char, TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, Escaping>]
    : Char extends "'"
    ? Depth extends 0
      ? TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, false>
      : [Char, [Char, TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, false>]]
    : TraverseLevelBracketsGroup<Rest, Depth, Increment<NexusLength>, Escaping>
  : [];

export type LinkedSleeveNexusLimit = 45;
export type UnwrapLinkedSleeve<Items extends any[]> = Items extends [infer A, [infer B, infer C]]
  ? A extends string
    ? B extends string
      ? UnwrapLinkedSleeve<[`${A}${B}`, C]>
      : Items
    : Items
  : Items extends [infer A, { next: infer B }]
  ? UnwrapLinkedSleeve<[A, B]>
  : Items extends [infer A, [infer B]]
  ? A extends string
    ? B extends string
      ? `${A}${B}`
      : Items
    : Items
  : Items extends [infer A, infer B]
  ? A extends string
    ? B extends string
      ? `${A}${B}`
      : Items
    : Items
  : Items;

type FinalTopLevelBracketsGroup<
  Template extends string,
  BracketsGroup = UnwrapLinkedSleeve<TraverseLevelBracketsGroup<Template>>,
> = BracketsGroup extends string ? BracketsGroup : never;
export type TopLevelBracketsGroup<Template extends string> = FinalTopLevelBracketsGroup<Template>;

type TrimHeadingComa<Template extends string> = Template extends ` ${infer Rest}`
  ? TrimHeadingComa<Rest>
  : Template extends `,${infer Rest}`
  ? TrimHeadingComa<Rest>
  : Template extends `\n${infer Rest}`
  ? TrimHeadingComa<Rest>
  : Template extends `\t${infer Rest}`
  ? TrimHeadingComa<Rest>
  : Template extends `\r${infer Rest}`
  ? TrimHeadingComa<Rest>
  : Template;
type OptionFromSelect<Template extends string> = TopLevelBracketsGroup<Template> extends string
  ? Template extends `${infer OptionType} ${TopLevelBracketsGroup<Template>}${infer After}`
    ? OptionType | OptionFromSelect<TrimHeadingComa<After>>
    : never
  : never;
type OptionsNestedVariables<Template extends string> = TopLevelBracketsGroup<Template> extends string
  ? Template extends `${string} ${TopLevelBracketsGroup<Template>}${infer After}`
    ? TopLevelBracketsGroup<Template> extends `{${infer Inner}}`
      ? {
          vars: [...BracketsExpressionsOfTemplate<Inner>['vars'], ...OptionsNestedVariables<After>['vars']];
        }
      : { vars: [...OptionsNestedVariables<After>['vars']] }
    : { vars: [] }
  : { vars: [] };
type OptionalSpacingSymbol = ' ' | '\n' | '\t' | '\r' | '';
export type OptionalSpacingSymbolSequence =
  | OptionalSpacingSymbol
  | `${OptionalSpacingSymbol}${OptionalSpacingSymbol}`
  | `${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}`
  | `${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}`
  | `${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}${OptionalSpacingSymbol}`;

type SelectParser<Template extends string> =
  TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbol}select,${infer SelectOptions}}`
    ? SelectVariable extends `${string}{${string}`
      ? { vars: [] }
      : {
          vars: [
            { name: SelectVariable; type: OptionFromSelect<TrimHeadingComa<SelectOptions>> },
            ...OptionsNestedVariables<SelectOptions>['vars'],
          ];
        }
    : { vars: [] };
type PluralParser<Template extends string> =
  TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}plural,${infer PluralOptions}}`
    ? SelectVariable extends `${string}{${string}`
      ? { vars: [] }
      : { vars: [{ name: SelectVariable; type: number }, ...OptionsNestedVariables<PluralOptions>['vars']] }
    : { vars: [] };
type SelectordinalParser<Template extends string> =
  TopLevelBracketsGroup<Template> extends `{${infer SelectVariable},${OptionalSpacingSymbolSequence}selectordinal,${infer PluralOptions}}`
    ? SelectVariable extends `${string}{${string}`
      ? { vars: [] }
      : { vars: [{ name: SelectVariable; type: number }, ...OptionsNestedVariables<PluralOptions>['vars']] }
    : { vars: [] };
type SimpleVarsParser<Template extends string> = TopLevelBracketsGroup<Template> extends `{${infer Inner}}`
  ? Inner extends `${string}{${string}}${string}`
    ? { vars: [...BracketsExpressionsOfTemplate<Inner>['vars']] }
    : { vars: [{ name: Inner; type: any }] }
  : { vars: [] };

declare global {
  interface NanointlBracketsParsers<Template extends string> {
    select: SelectParser<Template>;
    plural: PluralParser<Template>;
    selectordinal: SelectordinalParser<Template>;
  }
  // @ts-ignore
  interface NanointlOverallParsers<Template extends string, Values extends { [key: string]: any } = {}> {}
}

type BracketsParsersList<Template extends string> = UnionToArray<UnionOfValuesOf<NanointlBracketsParsers<Template>>>;
type OverallParsersList<Template extends string, Values extends { [key: string]: any } = {}> = UnionToArray<
  UnionOfValuesOf<NanointlOverallParsers<Template, Values>>
>;

type RunBracketsParsers<
  Template extends string,
  UnhandledParsers extends any[] = BracketsParsersList<Template>,
> = UnhandledParsers['length'] extends 1
  ? { vars: [...UnhandledParsers[0]['vars']] }
  : {
      vars: [...UnhandledParsers[0]['vars'], ...RunBracketsParsers<Template, ArrayShiftAny<UnhandledParsers>>['vars']];
    };
type RunOverallParsers<
  Template extends string,
  Values extends { [key: string]: any } = {},
  UnhandledParsers extends any[] = OverallParsersList<Template, Values>,
> = UnhandledParsers['length'] extends 1
  ? { vars: [...UnhandledParsers[0]['vars']] }
  : {
      vars: [...UnhandledParsers[0]['vars'], ...RunOverallParsers<Template, Values, ArrayShiftAny<UnhandledParsers>>['vars']];
    };

type BracketsExpressionsOfTemplate<Template extends string> = TopLevelBracketsGroup<Template> extends string
  ? Template extends `${string}${TopLevelBracketsGroup<Template>}${infer After}`
    ? RunBracketsParsers<Template>['vars']['length'] extends 0
      ? // @ts-ignore
        { vars: [...SimpleVarsParser<Template>['vars'], ...BracketsExpressionsOfTemplate<After>['vars']] }
      : // @ts-ignore
        { vars: [...RunBracketsParsers<Template>['vars'], ...BracketsExpressionsOfTemplate<After>['vars']] }
    : { vars: [] }
  : { vars: [] };

type VariablesArrToMap<VariablesArr extends { name: string; type: any }[]> = VariablesArr['length'] extends 0
  ? {}
  : {
      [Key in VariablesArr[0]['name'] | keyof VariablesArrToMap<ArrayShiftAny<VariablesArr>>]: Key extends VariablesArr[0]['name']
        ? Key extends keyof VariablesArrToMap<ArrayShiftAny<VariablesArr>>
          ? any extends VariablesArr[0]['type']
            ? any extends VariablesArrToMap<ArrayShiftAny<VariablesArr>>[Key]
              ? never
              : VariablesArrToMap<ArrayShiftAny<VariablesArr>>[Key]
            : VariablesArr[0]['type']
          : VariablesArr[0]['type']
        : Key extends keyof VariablesArrToMap<ArrayShiftAny<VariablesArr>>
        ? VariablesArrToMap<ArrayShiftAny<VariablesArr>>[Key]
        : never;
    };

// @ts-ignore
type ICUVariablesArrayFromTemplate<Template extends string, Values extends { [key: string]: any } = {}> = [
  ...BracketsExpressionsOfTemplate<Template>['vars'],
  ...RunOverallParsers<Template, Values>['vars'],
];

// @ts-ignore
export type ICUVariablesMapFromTemplate<Template extends string, Values extends { [key: string]: any } = {}> = VariablesArrToMap<
  // @ts-ignore
  ICUVariablesArrayFromTemplate<Template, Values>
>;

type CastNonObjectPropertiesToString<Values extends { [key: string]: any }> = {
  [Key in keyof Values]: Values[Key] extends { [key: string]: any } ? Values[Key] : string;
};
type CastMethodsToReturnType<Values extends { [key: string]: any }> = {
  [Key in keyof Values]: Values[Key] extends (...args: any[]) => infer ReturnType ? ReturnType : Values[Key];
};
export type SerializationResult<Values extends { [key: string]: any }> = UnionOfValuesOf<
  CastMethodsToReturnType<CastNonObjectPropertiesToString<Values>>
> extends string
  ? string
  : UnionOfValuesOf<CastMethodsToReturnType<CastNonObjectPropertiesToString<Values>>>[];
