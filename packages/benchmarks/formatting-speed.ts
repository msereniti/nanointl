import { hrtime } from 'node:process';
import fs from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const examples = {
  cart: '{count, plural, =0 {No items} one {One item} other {# items}} in your cart',
  social:
    '{gender, select, female {She has} male {He has} other {They have}} {followers, plural, =0 {no followers} one {one follower} other {# followers}}',
};
const values = {
  count: 0,
  price: 5,
  gender: 'test',
  followers: 5,
  username: 'John Doe',
  next_meeting: new Date(),
};
const messageIds = Object.keys(examples);

let time = {
  nanointl: [] as BigInt[],
  formatjs: [] as BigInt[],
  lingUi: [] as BigInt[],
};
const outputs: string[] = [];
const shuffleArray = <T extends any[]>(arr: T): T => arr.sort(() => 0.5 - Math.random());

const nanointl = await import('nanointl');
const runNanointl = async () => {
  const startTime = hrtime.bigint();
  const intl = nanointl.makeIntl('en', examples, { plugins: [] });
  for (let messageId of shuffleArray([...messageIds])) {
    outputs.push(intl.formatMessage(messageId as keyof typeof examples, values as any) as string);
  }
  time.nanointl.push(hrtime.bigint() - startTime);
};
const formatjs = await import('@formatjs/intl');
const runFormatjs = async () => {
  const startTime = hrtime.bigint();
  const intl = formatjs.createIntl({ messages: examples, locale: 'en' });
  for (let messageId of shuffleArray([...messageIds])) {
    outputs.push(intl.formatMessage({ id: messageId }, values));
  }
  time.formatjs.push(hrtime.bigint() - startTime);
};
const lingUi = await import('@lingui/core');
const { en: enPlurals } = await import('make-plural/plurals');
const runLingUi = async () => {
  const startTime = hrtime.bigint();
  const i18n = lingUi.setupI18n({ messages: { en: examples }, locale: 'en', localeData: { en: { plurals: enPlurals } } });
  for (let messageId of shuffleArray([...messageIds])) {
    outputs.push(i18n._(messageId, values));
  }
  time.lingUi.push(hrtime.bigint() - startTime);
};
const runners = [runNanointl, runFormatjs, runLingUi];

await Promise.all(
  Array(1000)
    .fill(0)
    .map(async (_) => {
      await Promise.all(shuffleArray([...runners].map((run) => run())));
      outputs.length = 0;
    }),
);

const resultsPath = resolvePath(fileURLToPath(import.meta.url), '../results.json');
const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));
results.time = {};
for (let packageName in time) {
  const sumTime = time[packageName as keyof typeof time].reduce((sum, item) => sum + item, BigInt(0));
  const avgTime = sumTime === BigInt(0) ? 0 : sumTime / BigInt(time[packageName as keyof typeof time].length);
  console.log(`${String(Number(avgTime)).padStart(10, ' ')}ns for ${packageName}`);
  results.time[packageName] = Number(avgTime);
}
await fs.writeFile(resultsPath, JSON.stringify(results));
