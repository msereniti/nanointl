import { describe, expect, test } from 'vitest';
import { makeIntl } from './makeIntl';
import { ICUVariablesMapFromTemplate } from './typings';

const formatEnMessage = <Message extends string>(message: Message, values: ICUVariablesMapFromTemplate<Message> | null): string =>
  makeIntl('en', { message }).formatMessage('message', values as any);

describe('makeIntl', () => {
  test('Message without interpolations', () => {
    expect(formatEnMessage('Hello world', null)).toBe('Hello world');
  });
  test('Interpolates exact plural', () => {
    expect(formatEnMessage('Found {count, plural, =0 {no results} one {1 result} other {{count} results}}', { count: 0 })).toBe(
      'Found no results',
    );
  });
  test('Interpolates "one" plural', () => {
    expect(formatEnMessage('Found {count, plural, =0 {no results} one {1 result} other {{count} results}}', { count: 1 })).toBe(
      'Found 1 result',
    );
  });
  test('Interpolates "other" plural', () => {
    expect(formatEnMessage('Found {count, plural, =0 {no results} one {1 result} other {{count} results}}', { count: 10 })).toBe(
      'Found 10 results',
    );
  });
  test("Doesn't loose text after plural", () => {
    expect(
      formatEnMessage('Found {count, plural, =0 {no results} one {1 result} other {{count} results}} there', { count: 10 }),
    ).toBe('Found 10 results there');
  });
  test('Interpolates select', () => {
    expect(formatEnMessage('{gender, select, male {xy}, female {xx}}', { gender: 'female' })).toBe('xx');
  });
  test('Handles nested structures', () => {
    expect(
      formatEnMessage(
        '{gender, select, female {She has {count, plural, one {apple} other {{count} apples}}} male {He has {count, plural, one {apple} other {{count} apples}}} other {They have {count, plural, one {apple} other {{count} apples}}}}',
        { gender: 'female', count: 10 },
      ),
    ).toBe('She has 10 apples');
  });
  test('Interpolates variables', () => {
    expect(formatEnMessage('Oh, hi {name}!', { name: 'Mark' })).toBe('Oh, hi Mark!');
  });
  test('Escapes interpolation with single quote', () => {
    expect(formatEnMessage("Oh, hi '{name}!", null)).toBe('Oh, hi {name}!');
  });
  test('Stops escaping on the next single quote', () => {
    expect(formatEnMessage("Oh, '{hi}' {name}!", { name: 'Mark' })).toBe('Oh, {hi} Mark!');
  });
  test('Preserves one single quote on double single quota sign', () => {
    expect(formatEnMessage("This '{isn''t}' obvious.", null)).toBe("This {isn't} obvious.");
  });
  test('Handles numbers sign', () => {
    expect(
      formatEnMessage('I have {count, plural, =0 {no books} one {one book} other {# books}}', {
        count: 10,
      }),
    ).toBe('I have 10 books');
  });
  test('Supports plural offset', () => {
    expect(
      formatEnMessage('{num, plural, offset:1 =-1{negative one} one{one} other{other}}', {
        num: 2,
      }),
    ).toBe('one');
  });
});
