import { describe, expect, test } from 'vitest';
import { AstNode, parseIcu, PostParser } from './parse';
import { markdownPlugin } from './markdown';
import { tagsPlugin } from './tags';

describe('Parser edge cases', () => {
  test('Select + plural', () => {
    expect(
      parseIcu(`Button {count, select, 0{wasn''t} other{was}} clicked {count, plural, =0 {} one{once} other {# times}}.`, {}),
    ).toEqual([
      'Button ',
      {
        type: 'select',
        variable: {
          type: 'variable',
          name: 'count',
          bracketsGroup: 1,
        },
        cardinal: true,
        options: { '0': ['wasn', { type: 'pure-text', text: "'" }, 't'], other: ['was'] },
      },
      ' clicked ',
      {
        type: 'plural',
        variable: {
          type: 'variable',
          name: 'count',
          bracketsGroup: 4,
        },
        cardinal: true,
        options: {
          exacts: {
            '0': [],
          },
          one: ['once'],
          other: [
            {
              data: {
                offset: undefined,
              },
              name: 'number',
              optionsPart: false,
              rawData: '#',
              type: 'external',
              variableName: 'count',
            },
            ' times',
          ],
        },
      },
      '.',
    ]);
  });
  test('escaping triggers text nodes split', () => {
    expect(parseIcu(`It''s how {person}' makes' interpolation: '{interpolated_variable}'`, {})).toEqual([
      'It',
      {
        type: 'pure-text',
        text: "'",
      },
      's how ',
      {
        type: 'variable',
        name: 'person',
        bracketsGroup: 1,
      },
      {
        type: 'pure-text',
        text: ' makes',
      },
      ' interpolation: ',
      {
        type: 'pure-text',
        text: '{interpolated_variable}',
      },
    ]);
  });
  test('post parsers combination', () => {
    const postParsers: PostParser<AstNode[], AstNode[]>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = () => {};
    tagsPlugin.init({ addPostParser: (postParser) => postParsers.push(postParser), addSerializer: noop, addParser: noop });
    markdownPlugin.init({ addPostParser: (postParser) => postParsers.push(postParser), addSerializer: noop, addParser: noop });
    expect(parseIcu(`It''s how {person}' makes' interpolation: '{interpolated_variable}'`, { postParsers })).toEqual([
      'It',
      {
        type: 'pure-text',
        text: "'",
      },
      's how ',
      {
        type: 'variable',
        name: 'person',
        bracketsGroup: 1,
      },
      {
        type: 'pure-text',
        text: ' makes',
      },
      ' interpolation: ',
      {
        type: 'pure-text',
        text: '{interpolated_variable}',
      },
    ]);
  });
});
