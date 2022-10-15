import { describe, expect, test } from 'vitest';
import { AstNode } from './parse';
import { makeTagsParsingExternalStore, tagsChunkParser, tagsPostParser } from './tags';

describe('tags', () => {
  test('simplest cases', () => {
    expect(tagsChunkParser('Hello <b>bold text</b> world')).toEqual([
      'Hello ',
      { type: 'external', name: 'tag', variableName: 'b', data: { children: ['bold text'] } },
      ' world',
    ]);
  });
  test('multiple tags', () => {
    expect(tagsChunkParser('<b>bold</b> text between <i>italic</i>')).toEqual([
      { type: 'external', name: 'tag', variableName: 'b', data: { children: ['bold'] } },
      ' text between ',
      { type: 'external', name: 'tag', variableName: 'i', data: { children: ['italic'] } },
    ]);
  });
  test('lone tag', () => {
    expect(tagsChunkParser('<strong />')).toEqual([
      { type: 'external', name: 'tag', variableName: 'strong', data: { children: [] } },
    ]);
  });
  test('nested tags', () => {
    expect(tagsChunkParser('Hello <b>before<i>bold and italic text</i>after</b> world')).toEqual([
      'Hello ',
      {
        type: 'external',
        name: 'tag',
        variableName: 'b',
        data: {
          children: [
            'before',
            { type: 'external', name: 'tag', variableName: 'i', data: { children: ['bold and italic text'] } },
            'after',
          ],
        },
      },
      ' world',
    ]);
  });
  test('wrong tags order throws', () => {
    expect(() => tagsChunkParser('Hello <i>before<b>bold and italic text</i>after</b> world')).toThrowError();
  });
  test('external store', () => {
    const externalStore = makeTagsParsingExternalStore();
    tagsChunkParser('Hello <b>bold ', externalStore);
    tagsChunkParser('text</b> world', externalStore);
    expect(externalStore.ast).toEqual([
      'Hello ',
      { type: 'external', name: 'tag', variableName: 'b', data: { children: ['bold text'] } },
      ' world',
    ]);
  });
  test('external store with nested tags', () => {
    const externalStore = makeTagsParsingExternalStore();
    tagsChunkParser('Hello <b>bef', externalStore);
    tagsChunkParser('ore<i>bol', externalStore);
    tagsChunkParser('d and it', externalStore);
    tagsChunkParser('alic te', externalStore);
    tagsChunkParser('xt</i>af', externalStore);
    tagsChunkParser('ter</b>', externalStore);
    tagsChunkParser(' world', externalStore);
    expect(externalStore.ast).toEqual([
      'Hello ',
      {
        type: 'external',
        name: 'tag',
        variableName: 'b',
        data: {
          children: [
            'before',
            { type: 'external', name: 'tag', variableName: 'i', data: { children: ['bold and italic text'] } },
            'after',
          ],
        },
      },
      ' world',
    ]);
  });
  test('external store with data injection', () => {
    const externalStore = makeTagsParsingExternalStore();
    tagsChunkParser('Hello <b>', externalStore);
    externalStore.ast.push({ injectedChild: true } as any);
    tagsChunkParser('</b> world', externalStore);
    expect(externalStore.ast).toEqual([
      'Hello ',
      { type: 'external', name: 'tag', variableName: 'b', data: { children: [{ injectedChild: true }] } },
      ' world',
    ]);
  });
});

describe('icu rich formatting', () => {
  describe('parsing', () => {
    test('simple case', () => {
      const parsedIcuAst: AstNode[] = ['Hello, <b>', { type: 'variable', name: 'username', bracketsGroup: 0 }, '</b>!'];

      const resultAst = tagsPostParser(parsedIcuAst);

      expect(resultAst).toEqual([
        'Hello, ',
        {
          type: 'external',
          name: 'tag',
          variableName: 'b',
          data: {
            children: [{ type: 'variable', name: 'username', bracketsGroup: 0 }],
          },
        },
        '!',
      ]);
    });
    test('nested tags', () => {
      const parsedIcuAst: AstNode[] = ['Hello, <b><i>', { type: 'variable', name: 'username', bracketsGroup: 0 }, '</i></b>!'];

      const resultAst = tagsPostParser(parsedIcuAst);

      expect(resultAst).toEqual([
        'Hello, ',
        {
          type: 'external',
          name: 'tag',
          variableName: 'b',
          data: {
            children: [
              {
                type: 'external',
                name: 'tag',
                variableName: 'i',
                data: {
                  children: [{ type: 'variable', name: 'username', bracketsGroup: 0 }],
                },
              },
            ],
          },
        },
        '!',
      ]);
    });
    test('nested icu', () => {
      const parsedIcuAst: AstNode[] = [
        {
          type: 'select',
          variable: { type: 'variable', name: 'gender', bracketsGroup: 0 },
          options: { male: ['<b>He</b>'], female: ['<b>She</b>'], other: ['<b>They</b>'] },
        },
        ' will pay for the night development!',
      ];

      const resultAst = tagsPostParser(parsedIcuAst);

      expect(resultAst).toEqual([
        {
          type: 'select',
          variable: { type: 'variable', name: 'gender', bracketsGroup: 0 },
          options: {
            male: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['He'] } }],
            female: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['She'] } }],
            other: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['They'] } }],
          },
        },
        ' will pay for the night development!',
      ]);
    });
    test('wrapped and nested icu', () => {
      const parsedIcuAst: AstNode[] = [
        '<i>',
        {
          type: 'select',
          variable: { type: 'variable', name: 'gender', bracketsGroup: 0 },
          options: { male: ['<b>He</b>'], female: ['<b>She</b>'], other: ['<b>They</b>'] },
        },
        '</i>',
      ];

      const resultAst = tagsPostParser(parsedIcuAst);

      expect(resultAst).toEqual([
        {
          type: 'external',
          name: 'tag',
          variableName: 'i',
          data: {
            children: [
              {
                type: 'select',
                variable: { type: 'variable', name: 'gender', bracketsGroup: 0 },
                options: {
                  male: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['He'] } }],
                  female: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['She'] } }],
                  other: [{ type: 'external', name: 'tag', variableName: 'b', data: { children: ['They'] } }],
                },
              },
            ],
          },
        },
      ]);
    });
  });
});

describe('tags postParser', () => {
  test('basic parsing of one level interpolation', () => {
    expect(
      tagsPostParser([
        'Edit <code>',
        {
          type: 'variable',
          name: 'filePath',
          bracketsGroup: 0,
        },
        '</code> and save to test HMR',
      ]),
    ).toEqual([
      'Edit ',
      {
        type: 'external',
        name: 'tag',
        variableName: 'code',
        data: {
          children: [
            {
              type: 'variable',
              name: 'filePath',
              bracketsGroup: 0,
            },
          ],
        },
      },
      ' and save to test HMR',
    ]);
  });
});
