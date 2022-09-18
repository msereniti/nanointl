/* eslint-disable @typescript-eslint/no-unused-vars */
type ArrayPushAny<Arr extends any[]> = [...Arr, any];
type ArrayShiftAny<Arr extends any[]> = Arr extends [infer Shifted, ...infer Rest] ? Rest : [];
type ArrayPopAny<Arr extends any[]> = Arr extends [...infer Rest, infer Popped] ? Rest : [];
type ArrayOfLength<Length extends number, Arr extends any[] = []> = Arr['length'] extends 999
  ? []
  : Arr['length'] extends Length
  ? Arr
  : ArrayOfLength<Length, ArrayPushAny<Arr>>;
type Increment<
  Value extends number,
  ArrayOfIncrementedLength = ArrayPushAny<ArrayOfLength<Value>>,
> = ArrayOfIncrementedLength extends any[]
  ? ArrayOfIncrementedLength['length'] extends number
    ? ArrayOfIncrementedLength['length']
    : Value
  : Value;
type Decrement<
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

type _TraverseLevelBracketsGroup<
  Template extends string,
  Depth extends number = 0,
  Length extends number = 0,
  Escaping extends boolean = false,
> = Length extends 45
  ? {
      next: _UnwrapLevelBracketsGroup<_TraverseLevelBracketsGroup<Template, Depth, 0, Escaping>>;
    }
  : Template extends `${infer Char}${infer Rest}`
  ? Escaping extends false
    ? Char extends "'"
      ? _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, true>
      : Char extends '{'
      ? [Char, _TraverseLevelBracketsGroup<Rest, Increment<Depth>, Increment<Length>, Escaping>]
      : Char extends '}'
      ? Depth extends 1
        ? ['}']
        : [Char, _TraverseLevelBracketsGroup<Rest, Decrement<Depth>, Increment<Length>, Escaping>]
      : Depth extends 0
      ? _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, Escaping>
      : [Char, _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, Escaping>]
    : Char extends `${'{' | '}'}`
    ? Depth extends 0
      ? _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, Escaping>
      : [Char, _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, Escaping>]
    : Char extends "'"
    ? Depth extends 0
      ? _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, false>
      : [Char, [Char, _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, false>]]
    : _TraverseLevelBracketsGroup<Rest, Depth, Increment<Length>, Escaping>
  : [];

type _UnwrapLevelBracketsGroup<Items extends any[]> = Items extends [infer A, [infer B, infer C]]
  ? A extends string
    ? B extends string
      ? _UnwrapLevelBracketsGroup<[`${A}${B}`, C]>
      : Items
    : Items
  : Items extends [infer A, { next: infer B }]
  ? _UnwrapLevelBracketsGroup<[A, B]>
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

type _FinalTopLevelBracketsGroup<
  Template extends string,
  BracketsGroup = _UnwrapLevelBracketsGroup<_TraverseLevelBracketsGroup<Template>>,
> = BracketsGroup extends string ? BracketsGroup : never;
export type TopLevelBracketsGroup<Template extends string> = _FinalTopLevelBracketsGroup<Template>;

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
          vars: [...VariablesInTemplate<Inner>['vars'], ...OptionsNestedVariables<After>['vars']];
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
    ? { vars: [...VariablesInTemplate<Inner>['vars']] }
    : { vars: [{ name: Inner; type: any }] }
  : { vars: [] };

declare global {
  interface NanointlParsers<Template extends string> {
    select: SelectParser<Template>;
    plural: PluralParser<Template>;
    selectordinal: SelectordinalParser<Template>;
  }
}

type AllParsersList<Template extends string> = UnionToArray<UnionOfValuesOf<NanointlParsers<Template>>>;

type RunAllParsers<
  Template extends string,
  UnhandledParsers extends any[] = AllParsersList<Template>,
> = UnhandledParsers['length'] extends 1
  ? { vars: [...UnhandledParsers[0]['vars']] }
  : {
      vars: [...UnhandledParsers[0]['vars'], ...RunAllParsers<Template, ArrayShiftAny<UnhandledParsers>>['vars']];
    };

type VariablesInTemplate<Template extends string> = TopLevelBracketsGroup<Template> extends string
  ? Template extends `${string}${TopLevelBracketsGroup<Template>}${infer After}`
    ? RunAllParsers<Template>['vars']['length'] extends 0
      ? { vars: [...SimpleVarsParser<Template>['vars'], ...VariablesInTemplate<After>['vars']] }
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { vars: [...RunAllParsers<Template>['vars'], ...VariablesInTemplate<After>['vars']] }
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

export type ICUVariablesMapFromTemplate<Template extends string> = VariablesArrToMap<VariablesInTemplate<Template>['vars']>;
