import { describe, test, expect, it } from 'vitest';
import esbuild from 'esbuild';
import fs from 'fs/promises';
import { sep as pathSep } from 'path';
import { parseIcu, ParseIcuOptions } from './parse';
import { serializeIcu } from './serialize';
import { makeIntlBase } from './intlBase';
import { makeTagsParsingExternalStore, tagsChunkParser, TagsAstNode, tagsPostSerializer, tagsPostParser } from './tags';
import fetch from 'node-fetch';
import { parseNumber, serializeNumber } from './number';
import { parseDateTime, serializeDate, serializeTime } from './datetime';

const vitestUtils = { describe, test, expect, it };
const externalParsers = { number: parseNumber, date: parseDateTime, time: parseDateTime };
const externalSerializers = { number: serializeNumber, date: serializeDate, time: serializeTime, tag: tagsPostSerializer };

const pathExists = async (path: string) => {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
};
const ensureDir = async (path: string) => {
  const parts = path.split(pathSep);
  for (let i = 1; i <= parts.length; i++) {
    const path = parts.slice(0, i).join(pathSep);
    if (await pathExists(path)) continue;
    await fs.mkdir(path);
  }
};

describe('Full compatibility with formatjs core api', async () => {
  const cacheDir = `./node_modules/.cache/nanointl-formatjs-compat`;
  await ensureDir(cacheDir);
  const date = new Date();
  const cacheFileName =
    date.getFullYear() +
    '-' +
    date.getMonth().toString().padStart(2, '0') +
    '-' +
    date.getDate().toString().padStart(2, '0') +
    '.ts';
  const cacheFilePath = `${cacheDir}/${cacheFileName}`;
  console.log(cacheFilePath);
  let testText = '';
  if (await pathExists(cacheFilePath)) {
    testText = await fs.readFile(cacheFilePath, 'utf-8');
  } else {
    const testTextRequest = await fetch(
      'https://raw.githubusercontent.com/formatjs/formatjs/main/packages/intl-messageformat/tests/index.test.ts',
    );
    testText = await testTextRequest.text();
    await fs.writeFile(cacheFilePath, testText);
  }
  const textWithoutImports = testText
    .split('\n')
    .filter((line) => !line.startsWith('import '))
    .join('\n');
  const { code: transpiledTest } = await esbuild.transform(textWithoutImports, { loader: 'ts' });
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { describe, test, expect, it } = vitestUtils;
    const makeCompatOptions = (message: string, formatjsOptions: any) => {
      const verboseParsing = {};
      const tagsHandler = {};
      const parsingOptions: ParseIcuOptions = {
        externalParsers,
        verboseParsing,
        postParsers: [tagsPostParser],
      };
      const ast = parseIcu(message, parsingOptions);
      for (const param in formatjsOptions ?? {}) {
        for (const node of ast) {
          if (typeof node === 'object' && node.type === 'external') {
            if (formatjsOptions[param].verbose) {
              verboseParsing[node.variableName] = formatjsOptions[param].verbose;
            }
          }
        }
      }
      return {
        verboseParsing,
        externalParsers,
        externalSerializers,
        original: message,
        tagsHandler,
        postParsers: [tagsPostParser],
      };
    };
    const formatToParts = (message: string, options: {}, values: {}, locale: string) => {
      const ast = Array.isArray(message) ? message : parseIcu(message, options);
      const compatValues = {
        tagsFallback: ({ children, tag }) => (children.length === 0 ? `<${tag}/>` : [`<${tag}>`, ...children, `</${tag}>`]),
      };
      for (const name in values) {
        if (typeof values[name] === 'function') {
          compatValues[name] = ({ children }) => values[name](Array.isArray(children) ? children : [children]);
        } else {
          compatValues[name] = values[name];
        }
      }

      const result = serializeIcu(ast, compatValues, makeIntlBase(locale), {
        ...options,
        externalParsers,
      });

      return (Array.isArray(result) ? result : [result]).map((part) => {
        if (typeof part !== 'object' || part === null) return { type: 'literal', value: part };
        else return { type: 'object', value: part };
      });
      // const parts = serializeIcu(ast, values, makeIntlBase(locale), {
      //   ...options,
      //   externalParsers,
      //   reducer: {
      //     getInit: () => [],
      //     reduce: (acc, item, nodeType) => {
      //       if (nodeType === 'variable') {
      //         acc.push({ interpolationSymbol, value: item });
      //         return acc;
      //       }
      //       const items = Array.isArray(item) ? item.flat() : [item];
      //       for (const item of items) {
      //         if (
      //           acc.length > 0 &&
      //           (typeof acc[acc.length - 1] !== 'object' || acc[acc.length - 1] === null) &&
      //           (typeof item !== 'object' || item === null)
      //         ) {
      //           acc[acc.length - 1] += String(item);
      //         } else {
      //           acc.push(item);
      //         }
      //       }
      //       return acc;
      //     },
      //   },
      // });
      // const handleParsedTagParts = (parts: TagsAstNode[]) =>
      //   parts
      //     .map((part) => {
      //       if (typeof part === 'string') return part;
      //       if (part.interpolationSymbol === interpolationSymbol) return part.value;
      //       if (part.tag) {
      //         if (typeof values[part.tag] !== 'function') {
      //           if (part.children.length > 0) {
      //             return `<${part.tag}>${handleParsedTagParts(part.children)}</${part.tag}>`;
      //           } else {
      //             return `<${part.tag}/>`;
      //           }
      //         }
      //         return values[part.tag](handleParsedTagParts(part.children));
      //       }
      //       return part;
      //     })
      //     .reduce((acc, item) => {
      //       if (typeof item === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += item;
      //       else if (Array.isArray(item)) acc.push(...item);
      //       else acc.push(item);
      //       return acc;
      //     }, []);
      // const tagsParsingStore = makeTagsParsingExternalStore();
      // for (const part of parts) {
      //   if (typeof part === 'string') tagsChunkParser(part, tagsParsingStore);
      //   else tagsParsingStore.ast.push(part);
      // }
      // const tagsParts = handleParsedTagParts(tagsParsingStore.ast);
      // return tagsParts
      //   .reduce((acc, item) => {
      //     if (typeof item === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += item;
      //     else if (Array.isArray(item)) acc.push(...item);
      //     else acc.push(item);
      //     return acc;
      //   }, [])
      //   .map((part) => {
      //     if (typeof part !== 'object' || part === null) return { type: 'literal', value: part };
      //     else return { type: 'object', value: part };
      //   });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const parse = (message: string, formatjsOptions: any) => {
      const options = makeCompatOptions(message, formatjsOptions);
      return parseIcu(message, options);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class IntlMessageFormat {
      static __parse(message: string, formatjsOptions: any) {
        const options = makeCompatOptions(message, formatjsOptions);
        return parseIcu(message, options);
      }
      constructor(message: string, locale = Intl.NumberFormat().resolvedOptions().locale, formatjsOptions: any) {
        this.format = (values: any) => {
          try {
            const options = makeCompatOptions(message, formatjsOptions);
            // const handleParsedTagParts = (parts: TagsAstNode[]) =>
            //   parts
            //     .map((part) => {
            //       if (typeof part === 'string') return part;
            //       if (part.tag) {
            //         if (typeof values[part.tag] !== 'function') {
            //           if (part.children.length > 0) {
            //             return `<${part.tag}>${handleParsedTagParts(part.children)}</${part.tag}>`;
            //           } else {
            //             return `<${part.tag}/>`;
            //           }
            //         }
            //         return values[part.tag](handleParsedTagParts(part.children));
            //       }
            //       return part;
            //     })
            //     .reduce((acc, item) => {
            //       if (typeof item !== 'object' && acc.length > 0 && typeof acc[acc.length - 1] !== 'object')
            //         acc[acc.length - 1] += item;
            //       else if (Array.isArray(item)) acc.push(...item);
            //       else acc.push(item);
            //       return acc;
            //     }, []);

            // const wrappedValues = {};
            // for (const key in values) {
            //   if (typeof values[key] === 'string') {
            //     wrappedValues[key] = `${values[key]}`; //.replace(/</g, '[').replace(/>/g, ']');
            //   } else {
            //     wrappedValues[key] = values[key];
            //   }
            // }
            const parts = formatToParts(message, options, values, locale)
              .map((part) => part.value)
              .reduce((acc, item) => {
                if (typeof item !== 'object' && acc.length > 0 && typeof acc[acc.length - 1] !== 'object')
                  acc[acc.length - 1] += item;
                else if (Array.isArray(item)) acc.push(...item);
                else acc.push(item);
                return acc;
              }, []);

            // const tagsParsedParts = parseTags(message);

            // const parts = handleParsedTagParts(tagsParsedParts)
            //   .flat()
            //   .reduce((acc, item) => {
            //     if (typeof item === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += item;
            //     else if (Array.isArray(item)) acc.push(...item);
            //     else acc.push(item);
            //     return acc;
            //   }, []);
            if (parts.length === 0) return '';
            if (parts.length === 1) return parts[0];
            return parts;
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.startsWith('Variable "')) {
                const [, variableName, , ...originalMessageParts] = error.message.split('"');
                originalMessageParts.pop();
                const originalMessage = originalMessageParts.join('"');
                throw new Error(
                  `The intl string context variable "${variableName}" was not provided to the string "${originalMessage}"`,
                );
              }
            }
            throw error;
          }
        };
        this.resolvedOptions = () => Intl.NumberFormat(locale).resolvedOptions();
        this.formatToParts = (values: any) => {
          const options = makeCompatOptions(message, formatjsOptions);

          return formatToParts(message, options, values, locale);
        };
      }
      resolvedOptions: () => { locale: string };
      format: (values: any) => string;
      formatToParts: (values: any) => { type: 'literal' | 'object'; value: any }[];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const PART_TYPE = { literal: 'literal', object: 'object' };
    eval(transpiledTest);
  }
});

// https://github.com/formatjs/formatjs/blob/main/packages/intl-messageformat/tests/index.test.ts
