import { ICUVariablesMapFromTemplate as I } from './typings';

const assertTypesEqual = <A, B>(a: A extends B ? (B extends A ? true : false) : false) => a;

assertTypesEqual<{}, {}>(true);
assertTypesEqual<[], {}>(false);

assertTypesEqual<I<'Message without interpolations'>, {}>(true);
assertTypesEqual<I<'Found {count, plural, =0 {no results} one {1 result} other {{count} results}}'>, { count: number }>(true);
assertTypesEqual<I<'{gender, select, male {xy}, female {xx}}'>, { gender: 'male' | 'female' }>(true);
assertTypesEqual<
  I<'{gender, select, female {She has {count, plural, one {apple} other {{count} apples}}} male {He has {count, plural, one {apple} other {{count} apples}}} other {They have {count, plural, one {apple} other {{count} apples}}}}'>,
  { gender: 'male' | 'female' | 'other'; count: number }
>(true);
assertTypesEqual<I<'Oh, hi {name}!'>, { name: any }>(true);
assertTypesEqual<I<'Oh, hi {a}!'>, { b: any }>(false);
assertTypesEqual<I<"Oh, hi '{name}!">, {}>(true);
assertTypesEqual<I<"Oh, '{hi}' {name}!">, { name: any }>(true);
assertTypesEqual<I<"This '{isn''t}' obvious.">, {}>(true);
assertTypesEqual<I<'I have {count, plural, =0 {no books} one {one book} other {# books}}'>, { count: number }>(true);
assertTypesEqual<I<'{amount, number, ::percent scale/0.01}'>, { amount: number }>(true);
assertTypesEqual<I<'{num, plural, offset:1 =-1{negative one} one{one} other{other}}'>, { num: number }>(true);
assertTypesEqual<I<'It goes from {start, date, xxx} to {end, date}'>, { start: Date; end: Date }>(true);
assertTypesEqual<I<'It goes from {start, date,xxx} to {end, date}'>, { start: Date; end: Date }>(true);
assertTypesEqual<I<'Count of clicks: {click, number}'>, { click: number }>(true);
assertTypesEqual<
  I<'{a, number} {b, number} {c, number} {d, date} {e, time} {f, date}'>,
  { a: number; b: number; c: number; d: Date; e: Date; f: Date }
>(true);
assertTypesEqual<
  I<'Hello <strong>{username}</strong>!'>,
  { username: any; strong: ({ children }: { children: string }) => unknown }
>(true);
assertTypesEqual<
  I<'Hello <strong my-useless-args>{username}</strong>!'>,
  { username: any; strong: ({ children }: { children: string }) => unknown }
>(true);
assertTypesEqual<
  I<'Hello <strong>{username}</strong>, <br/> what do you want <em>to drink</em>?'>,
  {
    username: any;
    strong: ({ children }: { children: string }) => unknown;
    br: () => unknown;
    em: ({ children }: { children: string }) => unknown;
  }
>(true);
assertTypesEqual<I<'Hello **{username}**!'>, { username: any; strong: ({ children }: { children: string }) => unknown }>(true);
assertTypesEqual<
  I<'Hello *{username}*, __how do you do__? [Find anything you need to know](https://google.com)'>,
  {
    username: any;
    strong: ({ children }: { children: string }) => unknown;
    emphasis: ({ children }: { children: string }) => unknown;
    link: ({ children, url }: { children: string; url: 'https://google.com' }) => unknown;
  }
>(true);
