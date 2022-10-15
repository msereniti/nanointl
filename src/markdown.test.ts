import { describe, expect, test } from 'vitest';
import { markdownChunkParser } from './markdown';

describe('markdown', () => {
  describe('parsing', () => {
    test('No markdown', () => {
      expect(markdownChunkParser('Hello world')).toEqual(['Hello world']);
    });
    test('Simple emphasis', () => {
      expect(markdownChunkParser('How do _you_ do?')).toEqual([
        'How do ',
        { type: 'external', name: 'md-token', variableName: 'emphasis', data: { children: ['you'] } },
        ' do?',
      ]);
    });
    test('Multiple emphasis', () => {
      expect(markdownChunkParser('How do _you_ do, _my dude_?')).toEqual([
        'How do ',
        { type: 'external', name: 'md-token', variableName: 'emphasis', data: { children: ['you'] } },
        ' do, ',
        { type: 'external', name: 'md-token', variableName: 'emphasis', data: { children: ['my dude'] } },
        '?',
      ]);
    });
    test('Double symbol emphasis', () => {
      expect(markdownChunkParser('How do __you__ do?')).toEqual([
        'How do ',
        { type: 'external', name: 'md-token', variableName: 'emphasis', data: { children: ['you'] } },
        ' do?',
      ]);
    });
    test('Simple strong', () => {
      expect(markdownChunkParser('How do *you* do?')).toEqual([
        'How do ',
        { type: 'external', name: 'md-token', variableName: 'strong', data: { children: ['you'] } },
        ' do?',
      ]);
    });
    test('Nested emphasis and strong', () => {
      expect(markdownChunkParser('How do *_you_* do?')).toEqual([
        'How do ',
        {
          type: 'external',
          name: 'md-token',
          variableName: 'strong',
          data: {
            children: [
              {
                type: 'external',
                name: 'md-token',
                variableName: 'emphasis',
                data: { children: ['you'] },
              },
            ],
          },
        },
        ' do?',
      ]);
    });
    test('Inline code', () => {
      expect(markdownChunkParser('How stupid you should be to wrap `JavaScript` name into code tag?')).toEqual([
        'How stupid you should be to wrap ',
        { type: 'external', name: 'md-token', variableName: 'code', data: { children: ['JavaScript'] } },
        ' name into code tag?',
      ]);
    });
    test('Links', () => {
      expect(markdownChunkParser('You can get in touch with via [telegram](https://phytonmk.t.me)')).toEqual([
        'You can get in touch with via ',
        {
          type: 'external',
          name: 'md-token',
          variableName: 'link',
          data: { url: 'https://phytonmk.t.me', children: ['telegram'] },
        },
      ]);
    });
    test('Square brackets', () => {
      expect(markdownChunkParser('I really like [telegram] messenger')).toEqual(['I really like [telegram] messenger']);
    });
  });
});
