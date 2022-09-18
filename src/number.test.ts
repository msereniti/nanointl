import { describe, expect, test } from 'vitest';
import { makeIntl } from '../src/makeIntl';
import { ICUVariablesMapFromTemplate } from '../src/typings';
import { numberPlugin } from './number';

const formatEnMessage = <Message extends string>(message: Message, values: ICUVariablesMapFromTemplate<Message> | null): string =>
  makeIntl('en', { message }, { plugins: [numberPlugin] }).formatMessage('message', values as any);

describe('Numbers parser', () => {
  test('Percents', () => {
    expect(formatEnMessage('{num, number, ::percent}', { num: 0.25 })).toBe('25%');
    expect(formatEnMessage('{num, number, ::%}', { num: 0.25 })).toBe('25%');
  });
  test('Fixed fraction', () => {
    expect(formatEnMessage('{num, number, ::.00}', { num: 25 })).toBe('25.00');
  });
  test('Percents and fixed fraction', () => {
    expect(formatEnMessage('{num, number, ::percent .00}', { num: 0.25 })).toBe('25.00%');
    expect(formatEnMessage('{num, number, ::% .00}', { num: 0.25 })).toBe('25.00%');
  });
  test('Scale', () => {
    expect(formatEnMessage('{num, number, ::scale/100}', { num: 0.3 })).toBe('30');
  });
  test('Percents and scale', () => {
    expect(formatEnMessage('{num, number, ::percent scale/100}', { num: 0.003 })).toBe('30%');
    expect(formatEnMessage('{num, number, ::%x100}', { num: 0.003 })).toBe('30%');
  });
  test('Units', () => {
    expect(formatEnMessage('{num, number, ::measure-unit/meter}', { num: 5 })).toBe('5 m');
    expect(formatEnMessage('{num, number, ::unit/meter}', { num: 5 })).toBe('5 m');
  });
  test('Units with full name', () => {
    expect(formatEnMessage('{num, number, ::measure-unit/meter unit-width-full-name}', { num: 5 })).toBe('5 meters');
    expect(formatEnMessage('{num, number, ::unit/meter unit-width-full-name}', { num: 5 })).toBe('5 meters');
  });
  test('Currencies', () => {
    expect(formatEnMessage('{num, number, ::currency/CAD}', { num: 10 })).toBe('CA$10.00');
  });
  test('Currencies with narrow symbol', () => {
    expect(formatEnMessage('{num, number, ::currency/CAD unit-width-narrow}', { num: 10 })).toBe('$10.00');
  });
  test('Compact form', () => {
    expect(formatEnMessage('{num, number, ::compact-short}', { num: 5000 })).toBe('5K');
    expect(formatEnMessage('{num, number, ::K}', { num: 5000 })).toBe('5K');
  });
  test('Full text compact form', () => {
    expect(formatEnMessage('{num, number, ::compact-long}', { num: 5000 })).toBe('5 thousand');
    expect(formatEnMessage('{num, number, ::KK}', { num: 5000 })).toBe('5 thousand');
  });
  test('Compact form with currency', () => {
    expect(formatEnMessage('{num, number, ::compact-short currency/CAD}', { num: 5000 })).toBe('CA$5K');
    expect(formatEnMessage('{num, number, ::K currency/CAD}', { num: 5000 })).toBe('CA$5K');
  });
  test('Just number', () => {
    expect(formatEnMessage('{num, number}', { num: 5000 })).toBe('5,000');
  });
  test('Group delimiter', () => {
    expect(formatEnMessage('{num, number, ::group-off}', { num: 5000 })).toBe('5000');
    expect(formatEnMessage('{num, number, ::,_}', { num: 5000 })).toBe('5000');
    expect(formatEnMessage('{num, number, ::group-always}', { num: 15000 })).toBe('15,000');
    expect(formatEnMessage('{num, number, ::,?}', { num: 15000 })).toBe('15,000');
  });
  test('Sign always', () => {
    expect(formatEnMessage('{num, number, ::sign-always}', { num: 60 })).toBe('+60');
    expect(formatEnMessage('{num, number, ::+!}', { num: 60 })).toBe('+60');
    expect(formatEnMessage('{num, number, ::sign-always}', { num: 0 })).toBe('+0');
    expect(formatEnMessage('{num, number, ::+!}', { num: 0 })).toBe('+0');
    expect(formatEnMessage('{num, number, ::sign-except-zero}', { num: 60 })).toBe('+60');
    expect(formatEnMessage('{num, number, ::+?}', { num: 60 })).toBe('+60');
  });
  test('Sign except zero', () => {
    expect(formatEnMessage('{num, number, ::sign-except-zero}', { num: 0 })).toBe('0');
    expect(formatEnMessage('{num, number, ::+?}', { num: 0 })).toBe('0');
  });
  test('Sign accounting with currencies', () => {
    expect(formatEnMessage('{num, number, ::sign-accounting currency/CAD}', { num: -40 })).toBe('(CA$40.00)');
    expect(formatEnMessage('{num, number, ::() currency/CAD}', { num: -40 })).toBe('(CA$40.00)');
  });
});
