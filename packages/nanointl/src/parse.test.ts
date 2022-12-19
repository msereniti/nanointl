import { describe, expect, test } from 'vitest';
import { parseIcu } from './parse';

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
        options: { '0': [`wasn't`], other: ['was'] },
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
              rawData: '',
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
});
