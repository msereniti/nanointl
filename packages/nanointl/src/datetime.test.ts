import { describe, expect, test } from 'vitest';
import { makeIntl } from './makeIntl';
import { ICUVariablesMapFromTemplate } from './typings';
import { dateTimePlugin } from './datetime';

const formatEnMessage = <Message extends string>(message: Message, values: ICUVariablesMapFromTemplate<Message> | null) =>
  makeIntl('en', { message }, { plugins: [dateTimePlugin] }).formatMessage('message', values as any) as string;

const startOfEverything = new Date(0);
const halfOfDayAfterStartOfEverything = new Date(1000 * 60 * 60 * 15);

describe('DateTime', () => {
  describe('auto', () => {
    test('short', () => {
      expect(formatEnMessage('{xDate, time, short}', { xDate: startOfEverything })).toBe('1/1/70, 1:00 AM');
    });
    test('medium', () => {
      expect(formatEnMessage('{xDate, time, medium}', { xDate: startOfEverything })).toBe('Jan 1, 1970, 1:00:00 AM');
    });
    test('long', () => {
      expect(formatEnMessage('{xDate, time, long}', { xDate: startOfEverything })).toBe('January 1, 1970 at 1:00:00 AM GMT+1');
    });
    test('full', () => {
      expect(formatEnMessage('{xDate, time, full}', { xDate: startOfEverything })).toBe(
        'Thursday, January 1, 1970 at 1:00:00 AM Central European Standard Time',
      );
    });
  });
  describe('Era designator', () => {
    test('narrow', () => {
      expect(formatEnMessage('{xDate, time, ::G}', { xDate: startOfEverything })).toBe('1/1/1970 A');
    });
    test('short', () => {
      expect(formatEnMessage('{xDate, time, ::GG}', { xDate: startOfEverything })).toBe('1/1/1970 AD');
    });
    test('long', () => {
      expect(formatEnMessage('{xDate, time, ::GGG}', { xDate: startOfEverything })).toBe('1/1/1970 Anno Domini');
    });
  });
  describe('year (2 symbols)', () => {
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::yy}', { xDate: startOfEverything })).toBe('70');
    });
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::yyyy}', { xDate: startOfEverything })).toBe('1970');
    });
  });
  describe('month in year', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::M}', { xDate: startOfEverything })).toBe('1');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::MM}', { xDate: startOfEverything })).toBe('01');
    });
    test('short', () => {
      expect(formatEnMessage('{xDate, time, ::MMM}', { xDate: startOfEverything })).toBe('Jan');
    });
    test('long', () => {
      expect(formatEnMessage('{xDate, time, ::MMMM}', { xDate: startOfEverything })).toBe('January');
    });
    test('narrow', () => {
      expect(formatEnMessage('{xDate, time, ::MMMMM}', { xDate: startOfEverything })).toBe('J');
    });
  });
  describe('day in month', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::d}', { xDate: startOfEverything })).toBe('1');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::dd}', { xDate: startOfEverything })).toBe('01');
    });
  });
  describe('day of week', () => {
    test('narrow', () => {
      expect(formatEnMessage('{xDate, time, ::E}', { xDate: startOfEverything })).toBe('T');
    });
    test('short', () => {
      expect(formatEnMessage('{xDate, time, ::EE}', { xDate: startOfEverything })).toBe('Thu');
    });
    test('long', () => {
      expect(formatEnMessage('{xDate, time, ::EEE}', { xDate: startOfEverything })).toBe('Thursday');
    });
  });
  describe('Hour', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::j}', { xDate: halfOfDayAfterStartOfEverything })).toBe('4 PM');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::jj}', { xDate: halfOfDayAfterStartOfEverything })).toBe('04 PM');
    });
  });
  describe('Hour [1-12]', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::h}', { xDate: halfOfDayAfterStartOfEverything })).toBe('4 PM');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::hh}', { xDate: halfOfDayAfterStartOfEverything })).toBe('04 PM');
    });
  });
  describe('Hour [0-23]', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::H}', { xDate: halfOfDayAfterStartOfEverything })).toBe('16');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::HH}', { xDate: halfOfDayAfterStartOfEverything })).toBe('16');
    });
  });
  describe('Minute', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::m}', { xDate: startOfEverything })).toBe('0');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::mm}', { xDate: startOfEverything })).toBe('0');
    });
  });
  describe('Second', () => {
    test('numeric', () => {
      expect(formatEnMessage('{xDate, time, ::s}', { xDate: startOfEverything })).toBe('0');
    });
    test('2-digit', () => {
      expect(formatEnMessage('{xDate, time, ::ss}', { xDate: startOfEverything })).toBe('0');
    });
  });
  describe('Time Zone', () => {
    test('short', () => {
      expect(formatEnMessage('{xDate, time, ::z}', { xDate: startOfEverything })).toBe('1/1/1970, GMT+1');
    });
    test('shortGeneric', () => {
      expect(formatEnMessage('{xDate, time, ::zz}', { xDate: startOfEverything })).toBe('1/1/1970, Spain Time');
    });
    test('long', () => {
      expect(formatEnMessage('{xDate, time, ::zzz}', { xDate: startOfEverything })).toBe(
        '1/1/1970, Central European Standard Time',
      );
    });
    test('longGeneric', () => {
      expect(formatEnMessage('{xDate, time, ::zzzz}', { xDate: startOfEverything })).toBe(
        '1/1/1970, Central European Standard Time',
      );
    });
  });
});
