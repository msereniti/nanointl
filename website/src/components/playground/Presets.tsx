import { Listbox } from '@headlessui/react';
import { useCallback, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { NanointlPlugin } from 'nanointl/makeIntl';
import { dateTimePlugin } from 'nanointl/datetime';
import { markdownPlugin } from 'nanointl/markdown';
import { tagsPlugin } from 'nanointl/tags';
import { numberPlugin } from 'nanointl/number';

export type Preset<V extends { [variableName: string]: any } = { [variableName: string]: any }> = {
  name: string;
  input: string;
  values: V;
  aniamtion?: (
    | string
    | { values: V }
    | { pause: number }
    | { plugins: NanointlPlugin<any>[] }
    | { preset: number }
    | { locale: string }
    | { scrollAttach: 'left' | 'right' | 'no' }
  )[];
  plugins: NanointlPlugin<any>[];
  locale: string;
};

export const presets: Preset[] = [
  {
    name: 'E-Com checkout',
    input: '{count, plural, =0 {No items} one {One item} other {# items}} in your cart',
    values: { count: 5 },
    plugins: [],
    locale: 'en',
    aniamtion: [
      '5',
      '5 i',
      '5 it',
      '5 ite',
      '5 item',
      '5 items',
      '5 items ',
      '5 items i',
      '5 items in',
      '5 items in ',
      '5 items in y',
      '5 items in yo',
      '5 items in you',
      '5 items in your',
      '5 items in your ',
      '5 items in your c',
      '5 items in your ca',
      '5 items in your car',
      '5 items in your cart',
      { values: { count: 5 } },
      { pause: 1000 },
      '{} items in your cart',
      '{c} items in your cart',
      '{co} items in your cart',
      '{cou} items in your cart',
      '{coun} items in your cart',
      '{count} items in your cart',
      '{count,} items in your cart',
      '{count, } items in your cart',
      '{count, p} items in your cart',
      '{count, pl} items in your cart',
      '{count, plu} items in your cart',
      '{count, plur} items in your cart',
      '{count, plura} items in your cart',
      '{count, plural} items in your cart',
      { pause: 1000 },
      '{count, plural, } items in your cart',
      '{count, plural, {}} items in your cart',
      '{count, plural, {#}} items in your cart',
      '{count, plural, o{#}} items in your cart',
      '{count, plural, ot{#}} items in your cart',
      '{count, plural, oth{#}} items in your cart',
      '{count, plural, othe{#}} items in your cart',
      '{count, plural, other{#}} items in your cart',
      '{count, plural, other {#}} items in your cart',
      '{count, plural, other {# }} items in your cart',
      '{count, plural, other {# i}} tems in your cart',
      '{count, plural, other {# it}} ems in your cart',
      '{count, plural, other {# ite}} ms in your cart',
      '{count, plural, other {# item}} s in your cart',
      '{count, plural, other {# items}}  in your cart',
      '{count, plural, other {# items}} in your cart',
      { pause: 2000 },
      { values: { count: 1 } },
      '{count, plural, o other {# items}} in your cart',
      '{count, plural, on other {# items}} in your cart',
      '{count, plural, one other {# items}} in your cart',
      '{count, plural, one {} other {# items}} in your cart',
      '{count, plural, one {O} other {# items}} in your cart',
      '{count, plural, one {On} other {# items}} in your cart',
      '{count, plural, one {One} other {# items}} in your cart',
      '{count, plural, one {One } other {# items}} in your cart',
      '{count, plural, one {One i} other {# items}} in your cart',
      '{count, plural, one {One it} other {# items}} in your cart',
      '{count, plural, one {One ite} other {# items}} in your cart',
      '{count, plural, one {One item} other {# items}} in your cart',
      { pause: 2000 },
      { values: { count: 0 } },
      '{count, plural, =one {One item} other {# items}} in your cart',
      '{count, plural, = one {One item} other {# items}} in your cart',
      '{count, plural, =0  one {One item} other {# items}} in your cart',
      '{count, plural, =0 {} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {N} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No } one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No i} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No it} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No ite} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No item} one {One item} other {# items}} in your cart',
      '{count, plural, =0 {No items} one {One item} other {# items}} in your cart',
      { pause: 5000 },
      { preset: 1 },
    ],
  },
  {
    name: 'Prices',
    input: 'Just {price, number, ::currency/USD} a month',
    values: { price: 5 },
    plugins: [numberPlugin],
    locale: 'en',
    aniamtion: [
      'J',
      'Ju',
      'Jus',
      'Just',
      'Just ',
      'Just 5',
      'Just $5',
      'Just $ 5',
      'Just $ 5 a',
      'Just $ 5 a ',
      'Just $ 5 a m',
      'Just $ 5 a mo',
      'Just $ 5 a mon',
      'Just $ 5 a mont',
      'Just $ 5 a month',
      'Just $ 5 a month',
      { values: { price: 5 } },
      { pause: 1000 },
      'Just $ {5} a month',
      'Just $ {p} a month',
      'Just $ {pr} a month',
      'Just $ {pri} a month',
      'Just $ {pric} a month',
      'Just $ {price} a month',
      'Just ${price} a month',
      { pause: 1000 },
      'Just {price} a month',
      'Just {price,} a month',
      'Just {price, n} a month',
      'Just {price, nu} a month',
      'Just {price, num} a month',
      'Just {price, numb} a month',
      'Just {price, numbe} a month',
      'Just {price, number} a month',
      { pause: 1000 },
      { plugins: [numberPlugin] },
      { pause: 1000 },
      'Just {price, number,} a month',
      'Just {price, number, } a month',
      'Just {price, number, :} a month',
      'Just {price, number, ::} a month',
      'Just {price, number, ::c} a month',
      'Just {price, number, ::cu} a month',
      'Just {price, number, ::cur} a month',
      'Just {price, number, ::curr} a month',
      'Just {price, number, ::curre} a month',
      'Just {price, number, ::curren} a month',
      'Just {price, number, ::currenc} a month',
      'Just {price, number, ::currency} a month',
      'Just {price, number, ::currency/} a month',
      'Just {price, number, ::currency/U} a month',
      'Just {price, number, ::currency/US} a month',
      'Just {price, number, ::currency/USD} a month',
      { pause: 5000 },
      { preset: 2 },
    ],
  },
  {
    name: 'Social bio',
    input:
      '{gender, select, female {She has} male {He has} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
    values: { followers: 5, gender: 'non-binary' },
    plugins: [],
    aniamtion: [
      'T',
      'Th',
      'The',
      'They',
      'They ',
      'They h',
      'They ha',
      'They hav',
      'They have',
      'They have ',
      'They have n',
      'They have no',
      'They have no ',
      'They have no f',
      'They have no fo',
      'They have no fol',
      'They have no foll',
      'They have no follo',
      'They have no follow',
      'They have no followe',
      'They have no follower',
      'They have no followers',
      { values: { followers: 0 } },
      { pause: 500, scrollAttach: 'right' },
      'They have o followers',
      'They have  followers',
      'They have followers',
      'They have {followers}',
      'They have {followers, }',
      'They have {followers, pl}',
      'They have {followers, plu}',
      'They have {followers, plur}',
      'They have {followers, plura}',
      'They have {followers, plural}',
      'They have {followers, plural,}',
      'They have {followers, plural, }',
      'They have {followers, plural, =}',
      'They have {followers, plural, =0}',
      'They have {followers, plural, =0 {}}',
      'They have {followers, plural, =0 {n}}',
      'They have {followers, plural, =0 {no}}',
      'They have {followers, plural, =0 {no }}',
      'They have {followers, plural, =0 {no f}}',
      'They have {followers, plural, =0 {no fo}}',
      'They have {followers, plural, =0 {no fol}}',
      'They have {followers, plural, =0 {no foll}}',
      'They have {followers, plural, =0 {no follo}}',
      'They have {followers, plural, =0 {no follow}}',
      'They have {followers, plural, =0 {no followe}}',
      'They have {followers, plural, =0 {no follower}}',
      'They have {followers, plural, =0 {no followers}}',
      'They have {followers, plural, =0 {no followers} }',
      'They have {followers, plural, =0 {no followers} o}',
      'They have {followers, plural, =0 {no followers} on}',
      'They have {followers, plural, =0 {no followers} one}',
      'They have {followers, plural, =0 {no followers} one }',
      'They have {followers, plural, =0 {no followers} one {}}',
      'They have {followers, plural, =0 {no followers} one {o}}',
      'They have {followers, plural, =0 {no followers} one {on}}',
      'They have {followers, plural, =0 {no followers} one {one}}',
      'They have {followers, plural, =0 {no followers} one {one }}',
      'They have {followers, plural, =0 {no followers} one {one f}}',
      'They have {followers, plural, =0 {no followers} one {one fo}}',
      'They have {followers, plural, =0 {no followers} one {one fol}}',
      'They have {followers, plural, =0 {no followers} one {one foll}}',
      'They have {followers, plural, =0 {no followers} one {one follo}}',
      'They have {followers, plural, =0 {no followers} one {one follow}}',
      'They have {followers, plural, =0 {no followers} one {one followe}}',
      'They have {followers, plural, =0 {no followers} one {one follower}}',
      'They have {followers, plural, =0 {no followers} one {one follower} }',
      'They have {followers, plural, =0 {no followers} one {one follower} o}',
      'They have {followers, plural, =0 {no followers} one {one follower} ot}',
      'They have {followers, plural, =0 {no followers} one {one follower} oth}',
      'They have {followers, plural, =0 {no followers} one {one follower} othe}',
      'They have {followers, plural, =0 {no followers} one {one follower} other}',
      'They have {followers, plural, =0 {no followers} one {one follower} other }',
      'They have {followers, plural, =0 {no followers} one {one follower} other {}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {#}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# }}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# f}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# fo}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# fol}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# fol}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# follo}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# follow}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# followe}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# follower}}',
      'They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { values: { followers: 1 } },
      { values: { followers: 2 } },
      { values: { followers: 3 } },
      { values: { followers: 4 } },
      { values: { followers: 5 } },
      { values: { followers: 55 } },
      { values: { followers: 555 } },
      { values: { followers: 5555 } },
      { pause: 500, scrollAttach: 'left' },
      { values: { gender: 'f', followers: 5555 } },
      { values: { gender: 'fe', followers: 5555 } },
      { values: { gender: 'fem', followers: 5555 } },
      { values: { gender: 'fema', followers: 5555 } },
      { values: { gender: 'femal', followers: 5555 } },
      { values: { gender: 'female', followers: 5555 } },
      { pause: 500 },
      '{}They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{g} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{ge} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gen} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gend} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gende} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { pause: 500 },
      '{gender,} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, } They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, s} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, se} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, sel} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, sele} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, selec} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select,} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, o} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, ot} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, oth} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, othe} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other } They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {}} They have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { pause: 500 },
      '{gender, select, other {T}} hey have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {Th}} ey have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {The}} ey have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They}}  have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They}} have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They}} have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They }}have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They h}}have {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They ha}}ve {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They hav}}e {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { pause: 500 },
      '{gender, select,  other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, f other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, fe other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, fem other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, fema other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, femal other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female  other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {S} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {Sh} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She } other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She h} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She ha} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { pause: 500 },
      '{gender, select, female {She has}  other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} m other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} ma other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} mal other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male  other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {H} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {He} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {He } other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {He h} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {He ha} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      '{gender, select, female {She has} male {He has} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
      { pause: 5000 },
      { preset: 3 },
    ],
    locale: 'en',
  },
  {
    name: 'Markdown',
    input: 'Hi, **{username}**! Next meeting at {next_meeting, date, ::hhmm}',
    values: {
      username: 'John Doe',
      next_meeting: new Date(),
    },
    plugins: [markdownPlugin, dateTimePlugin],
    aniamtion: [
      'H',
      'Hi',
      'Hi,',
      'Hi, ',
      'Hi, J',
      'Hi, Jo',
      'Hi, Joh',
      'Hi, John',
      'Hi, John ',
      'Hi, John D',
      'Hi, John Do',
      'Hi, John Doe',
      'Hi, John Doe!',
      { values: { username: '' }, pause: 500 },
      'Hi, {John Doe}!',
      'Hi, {uohn Doe}!',
      'Hi, {ushn Doe}!',
      'Hi, {usen Doe}!',
      'Hi, {user Doe}!',
      'Hi, {usernDoe}!',
      'Hi, {usernaoe}!',
      'Hi, {username}!',
      { pause: 500 },
      { values: { username: 'J' } },
      { values: { username: 'Jo' } },
      { values: { username: 'Joh' } },
      { values: { username: 'John' } },
      { values: { username: 'John ' } },
      { values: { username: 'John D' } },
      { values: { username: 'John Do' } },
      { values: { username: 'John Doe' } },
      { pause: 500 },
      'Hi, *{username}!',
      'Hi, *{username}*!',
      'Hi, **{username}*!',
      'Hi, **{username}**!',
      { pause: 500 },
      { plugins: [markdownPlugin] },
      { pause: 500, scrollAttach: 'right' },
      'Hi, **{username}**! ',
      'Hi, **{username}**! N',
      'Hi, **{username}**! Ne',
      'Hi, **{username}**! Nex',
      'Hi, **{username}**! Next',
      'Hi, **{username}**! Next ',
      'Hi, **{username}**! Next m',
      'Hi, **{username}**! Next me',
      'Hi, **{username}**! Next mee',
      'Hi, **{username}**! Next meet',
      'Hi, **{username}**! Next meeti',
      'Hi, **{username}**! Next meetin',
      'Hi, **{username}**! Next meeting',
      'Hi, **{username}**! Next meeting ',
      'Hi, **{username}**! Next meeting a',
      'Hi, **{username}**! Next meeting at',
      'Hi, **{username}**! Next meeting at ',
      'Hi, **{username}**! Next meeting at 5',
      'Hi, **{username}**! Next meeting at 5p',
      'Hi, **{username}**! Next meeting at 5pm',
      { values: { username: 'John Doe', next_meeting: new Date() } },
      { pause: 500 },
      'Hi, **{username}**! Next meeting at {5pm}',
      'Hi, **{username}**! Next meeting at {n}',
      'Hi, **{username}**! Next meeting at {ne}',
      'Hi, **{username}**! Next meeting at {nex}',
      'Hi, **{username}**! Next meeting at {next}',
      'Hi, **{username}**! Next meeting at {next_}',
      'Hi, **{username}**! Next meeting at {next_m}',
      'Hi, **{username}**! Next meeting at {next_me}',
      'Hi, **{username}**! Next meeting at {next_mee}',
      'Hi, **{username}**! Next meeting at {next_meet}',
      'Hi, **{username}**! Next meeting at {next_meeti}',
      'Hi, **{username}**! Next meeting at {next_meetin}',
      'Hi, **{username}**! Next meeting at {next_meeting}',
      'Hi, **{username}**! Next meeting at {next_meeting,}',
      'Hi, **{username}**! Next meeting at {next_meeting, }',
      'Hi, **{username}**! Next meeting at {next_meeting, d}',
      'Hi, **{username}**! Next meeting at {next_meeting, da}',
      'Hi, **{username}**! Next meeting at {next_meeting, dat}',
      'Hi, **{username}**! Next meeting at {next_meeting, date}',
      { pause: 500 },
      { plugins: [markdownPlugin, dateTimePlugin] },
      { pause: 500 },
      'Hi, **{username}**! Next meeting at {next_meeting, date,}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, }',
      'Hi, **{username}**! Next meeting at {next_meeting, date, :}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, ::}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, ::h}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, ::hh}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, ::hhm}',
      'Hi, **{username}**! Next meeting at {next_meeting, date, ::hhmm}',
      { pause: 5000, scrollAttach: 'left' },
      { preset: 4 },
    ],
    locale: 'en',
  },
  {
    name: 'XML tags ',
    input: 'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::hhmm}',
    values: {
      username: 'John Doe',
      next_meeting: new Date(),
    },
    plugins: [dateTimePlugin, tagsPlugin],
    aniamtion: [
      'H',
      'Hi',
      'Hi,',
      'Hi, ',
      'Hi, J',
      'Hi, Jo',
      'Hi, Joh',
      'Hi, John',
      'Hi, John ',
      'Hi, John D',
      'Hi, John Do',
      'Hi, John Doe',
      'Hi, John Doe!',
      { pause: 500, values: { username: '' } },
      'Hi, {John Doe}!',
      'Hi, {uohn Doe}!',
      'Hi, {ushn Doe}!',
      'Hi, {usen Doe}!',
      'Hi, {user Doe}!',
      'Hi, {usernDoe}!',
      'Hi, {usernaoe}!',
      'Hi, {username}!',
      { pause: 500 },
      { values: { username: 'J' } },
      { values: { username: 'Jo' } },
      { values: { username: 'Joh' } },
      { values: { username: 'John' } },
      { values: { username: 'John ' } },
      { values: { username: 'John D' } },
      { values: { username: 'John Do' } },
      { values: { username: 'John Doe' } },
      { pause: 500 },
      'Hi, <{username}!',
      'Hi, <s{username}!',
      'Hi, <st{username}!',
      'Hi, <str{username}!',
      'Hi, <stro{username}!',
      'Hi, <stron{username}!',
      'Hi, <strong{username}!',
      'Hi, <strong>{username}!',
      'Hi, <strong>{username}<!',
      'Hi, <strong>{username}</!',
      'Hi, <strong>{username}</s!',
      'Hi, <strong>{username}</st!',
      'Hi, <strong>{username}</str!',
      'Hi, <strong>{username}</stro!',
      'Hi, <strong>{username}</stron!',
      'Hi, <strong>{username}</strong!',
      'Hi, <strong>{username}</strong>!',
      { pause: 500 },
      { plugins: [tagsPlugin] },
      { pause: 500, scrollAttach: 'right' },
      'Hi, <strong>{username}</strong>! ',
      'Hi, <strong>{username}</strong>! N',
      'Hi, <strong>{username}</strong>! Ne',
      'Hi, <strong>{username}</strong>! Nex',
      'Hi, <strong>{username}</strong>! Next',
      'Hi, <strong>{username}</strong>! Next ',
      'Hi, <strong>{username}</strong>! Next m',
      'Hi, <strong>{username}</strong>! Next me',
      'Hi, <strong>{username}</strong>! Next mee',
      'Hi, <strong>{username}</strong>! Next meet',
      'Hi, <strong>{username}</strong>! Next meeti',
      'Hi, <strong>{username}</strong>! Next meetin',
      'Hi, <strong>{username}</strong>! Next meeting',
      'Hi, <strong>{username}</strong>! Next meeting ',
      'Hi, <strong>{username}</strong>! Next meeting a',
      'Hi, <strong>{username}</strong>! Next meeting at',
      'Hi, <strong>{username}</strong>! Next meeting at ',
      'Hi, <strong>{username}</strong>! Next meeting at 5',
      'Hi, <strong>{username}</strong>! Next meeting at 5p',
      'Hi, <strong>{username}</strong>! Next meeting at 5pm',
      { values: { username: 'John Doe', next_meeting: new Date() } },
      { pause: 500 },
      'Hi, <strong>{username}</strong>! Next meeting at {5pm}',
      'Hi, <strong>{username}</strong>! Next meeting at {n}',
      'Hi, <strong>{username}</strong>! Next meeting at {ne}',
      'Hi, <strong>{username}</strong>! Next meeting at {nex}',
      'Hi, <strong>{username}</strong>! Next meeting at {next}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_m}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_me}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_mee}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meet}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeti}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meetin}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting,}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, }',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, d}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, da}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, dat}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date}',
      { pause: 500 },
      { plugins: [tagsPlugin, dateTimePlugin] },
      { pause: 500 },
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date,}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, }',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, :}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::h}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::hh}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::hhm}',
      'Hi, <strong>{username}</strong>! Next meeting at {next_meeting, date, ::hhmm}',
      { pause: 5000, scrollAttach: 'left' },
      { preset: 0 },
    ],
    locale: 'en',
  },
];

export const initialPreset = presets[0];

export const variablesDefaultMapper = {
  tagsFallback: ({ children, tag: Tag }) => {
    if (Tag === 'script' || Tag === 'link') return '💩';
    if (!children) return <Tag />;
    return <Tag>{children}</Tag>;
  },
  strong: ({ children }) => <strong>{children}</strong>,
  emphasis: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code>{children}</code>,
  link: ({ children, url }) => (
    <a href={url} rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export const PresetsSelect: React.FC<{ initialPreset: Preset; onPresetChange: (preset: Preset) => void }> = ({
  initialPreset,
  onPresetChange,
}) => {
  const [preset, setPreset] = useState(initialPreset);
  const handlePresetChange = useCallback(
    (preset: Preset) => {
      setPreset(preset);
      onPresetChange(preset);
    },
    [onPresetChange],
  );
  const [overlayTransform, setOverlayTransform] = useState<undefined | string>(undefined);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOverlayTransform(`translateY(-${presets.indexOf(preset) * 24}px)`);
    }, 100);

    return () => clearTimeout(timeout);
  }, [preset]);

  return (
    <Listbox value={preset} onChange={handlePresetChange} as="div" className="relative z-10">
      <Listbox.Button className="flex items-center border border-gray-300 pl-2 pr-1 rounded">
        {preset.name}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1">
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Listbox.Button>
      <Transition
        style={{ transform: overlayTransform }}
        className="absolute top-0 left-0 "
        enter="transition duration-150 ease-out"
        enterFrom="transform opacity-0"
        enterTo="transform opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform opacity-100"
        leaveTo="transform opacity-0"
      >
        <Listbox.Options className="border bg-slate-800 rounded w-60 text-left overflow-auto">
          {presets.map((preset): any => (
            <Listbox.Option key={preset.name} value={preset} className="cursor-pointer hover:bg-slate-700 px-2">
              {preset.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};
