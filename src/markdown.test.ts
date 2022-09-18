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
        { type: 'md-token', token: 'emphasis', children: ['you'] },
        ' do?',
      ]);
    });
    test('Multiple emphasis', () => {
      expect(markdownChunkParser('How do _you_ do, _my dude_?')).toEqual([
        'How do ',
        { type: 'md-token', token: 'emphasis', children: ['you'] },
        ' do, ',
        { type: 'md-token', token: 'emphasis', children: ['my dude'] },
        '?',
      ]);
    });
    test('Double symbol emphasis', () => {
      expect(markdownChunkParser('How do __you__ do?')).toEqual([
        'How do ',
        { type: 'md-token', token: 'emphasis', children: ['you'] },
        ' do?',
      ]);
    });
    test('Simple strong', () => {
      expect(markdownChunkParser('How do *you* do?')).toEqual([
        'How do ',
        { type: 'md-token', token: 'strong', children: ['you'] },
        ' do?',
      ]);
    });
    test('Nested emphasis and strong', () => {
      expect(markdownChunkParser('How do *_you_* do?')).toEqual([
        'How do ',
        { type: 'md-token', token: 'strong', children: [{ type: 'md-token', token: 'emphasis', children: ['you'] }] },
        ' do?',
      ]);
    });
    test('Inline code', () => {
      expect(markdownChunkParser('How stupid you should be to wrap `JavaScript` name into code tag?')).toEqual([
        'How stupid you should be to wrap ',
        { type: 'md-token', token: 'code', children: ['JavaScript'] },
        ' name into code tag?',
      ]);
    });
    test('Blocks', () => {
      expect(markdownChunkParser('First line\n\nSecond line')).toEqual([
        {
          type: 'md-token',
          token: 'block',
          children: ['First line'],
        },
        {
          type: 'md-token',
          token: 'block',
          children: ['Second line'],
        },
      ]);
    });
    test('Quote block', () => {
      expect(
        markdownChunkParser(
          "As Albert Einstein once said,\n\n> Don''t believe every quote you read on the internet.\n\nI love his wise words.",
        ),
      ).toEqual([
        {
          type: 'md-token',
          token: 'block',
          children: ['As Albert Einstein once said,'],
        },
        {
          type: 'md-token',
          token: 'quote',
          children: ["Don't believe every quote you read on the internet."],
        },
        {
          type: 'md-token',
          token: 'block',
          children: ['I love his wise words.'],
        },
      ]);
    });
    test('Code block', () => {
      expect(
        markdownChunkParser(
          "Let''s start with a simple hello world example\n\n```\n>++++++++[<+++++++++>-]<.>++++[<+++++++>-]<+.+++++++..+++.>>++++++[<+++++++>-]<+\n+.------------.>++++++[<+++++++++>-]<+.<.+++.------.--------.>>>++++[<++++++++>-\n]<+.\n```",
        ),
      ).toEqual([
        {
          type: 'md-token',
          token: 'block',
          children: ["Let's start with a simple hello world example"],
        },
        {
          type: 'md-token',
          token: 'block',
          children: [
            '>++++++++[<+++++++++>-]<.>++++[<+++++++>-]<+.+++++++..+++.>>++++++[<+++++++>-]<+\n+.------------.>++++++[<+++++++++>-]<+.<.+++.------.--------.>>>++++[<++++++++>-\n]<+.',
          ],
        },
      ]);
    });
  });
});
