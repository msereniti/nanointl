import { ICUVariablesMapFromTemplate as X } from './typings';

const assertTypesEqual = <A, B>(a: A extends B ? (B extends A ? true : false) : false) => a;

assertTypesEqual<{}, {}>(true);
assertTypesEqual<[], {}>(false);

assertTypesEqual<X<'Message without interpolations'>, {}>(true);
assertTypesEqual<X<'Found {count, plural, =0 {no results} one {1 result} other {{count} results}}'>, { count: number }>(true);
assertTypesEqual<X<'{gender, select, male {xy}, female {xx}}'>, { gender: 'male' | 'female' }>(true);
assertTypesEqual<
  X<'{gender, select, female {She has {count, plural, one {apple} other {{count} apples}}} male {He has {count, plural, one {apple} other {{count} apples}}} other {They have {count, plural, one {apple} other {{count} apples}}}}'>,
  { gender: 'male' | 'female' | 'other'; count: number }
>(true);
assertTypesEqual<X<'Oh, hi {name}!'>, { name: any }>(true);
assertTypesEqual<X<'Oh, hi {a}!'>, { b: any }>(false);
assertTypesEqual<X<"Oh, hi '{name}!">, {}>(true);
assertTypesEqual<X<"Oh, '{hi}' {name}!">, { name: any }>(true);
assertTypesEqual<X<"This '{isn''t}' obvious.">, {}>(true);
assertTypesEqual<X<'I have {count, plural, =0 {no books} one {one book} other {# books}}'>, { count: number }>(true);
assertTypesEqual<X<'{amount, number, ::percent scale/0.01}'>, { amount: number }>(true);
assertTypesEqual<X<'{num, plural, offset:1 =-1{negative one} one{one} other{other}}'>, { num: number }>(true);
assertTypesEqual<X<'It goes from {start, date, xxx} to {end, date}'>, { start: Date; end: Date }>(true);
assertTypesEqual<X<'It goes from {start, date,xxx} to {end, date}'>, { start: Date; end: Date }>(true);
assertTypesEqual<X<'Count of clicks: {click, number}'>, { click: number }>(true);
assertTypesEqual<
  X<'{a, number} {b, number} {c, number} {d, date} {e, time} {f, date}'>,
  { a: number; b: number; c: number; d: Date; e: Date; f: Date }
>(true);
