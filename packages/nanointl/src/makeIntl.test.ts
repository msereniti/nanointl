import { describe, expect, test } from 'vitest';
import { makeIntl } from './makeIntl';
import { tagsPlugin } from './tags';
import { markdownPlugin } from './markdown';
import { ICUVariablesMapFromTemplate } from './typings';

const formatEnMessage = <Message extends string>(message: Message, values: ICUVariablesMapFromTemplate<Message> | null) =>
  makeIntl('en', { message }).formatMessage('message', values as any) as string;

describe('pure intl', () => {
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

describe('plugins integrations', () => {
  test('tags plugin', () => {
    const message = 'Hello, <strong>{username}</strong>!' as const;
    const intl = makeIntl('en', { message }, { plugins: [tagsPlugin] });

    expect(
      intl.formatMessage('message', {
        username: 'Sereniti',
        strong: ({ children }) => ({ is: 'some-object-entity', children }),
      }),
    ).toEqual(['Hello, ', { is: 'some-object-entity', children: `Sereniti` }, '!']);
  });
  test('markdown plugin', () => {
    const message = 'Hello, **{username}**!' as const;
    const intl = makeIntl('en', { message }, { plugins: [markdownPlugin] });

    expect(
      intl.formatMessage('message', {
        username: 'Sereniti',
        strong: ({ children }) => ({ is: 'some-object-entity', children }),
      }),
    ).toEqual(['Hello, ', { is: 'some-object-entity', children: `Sereniti` }, '!']);
  });

  type ProducedNode = { is: string; children: string | ProducedNode[] };
  test('tags + markdown plugins', () => {
    const message = 'Hello, <code>**{username}**</code>!' as const;
    const intl = makeIntl('en', { message }, { plugins: [tagsPlugin, markdownPlugin] });

    expect(
      intl.formatMessage('message', {
        username: 'Sereniti',
        strong: ({ children }): ProducedNode => ({ is: 'md-produced-node', children }),
        code: ({ children }: { children: (ProducedNode | string)[] }) => ({ is: 'tags-produced-node', children }),
      }),
    ).toEqual(['Hello, ', { is: 'tags-produced-node', children: [{ is: 'md-produced-node', children: `Sereniti` }] }, '!']);
  });

  test('markdown + tags plugins', () => {
    const message = 'Hello, **<code>{username}</code>**!' as const;
    const intl = makeIntl('en', { message }, { plugins: [tagsPlugin, markdownPlugin] });

    expect(
      intl.formatMessage('message', {
        username: 'Sereniti',
        code: ({ children }): ProducedNode => ({ is: 'tags-produced-node', children }),
        strong: ({ children }: { children: (ProducedNode | string)[] }) => ({ is: 'md-produced-node', children }),
      }),
    ).toEqual(['Hello, ', { is: 'md-produced-node', children: [{ is: 'tags-produced-node', children: `Sereniti` }] }, '!']);
  });
});
