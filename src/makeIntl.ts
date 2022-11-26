import { makeIntlBase } from './intlBase';
import { AstNode, ExternalParser, ExternalParsers, parseIcu, ParseIcuOptions, PostParser } from './parse';
import { ExternalSerializer, ExternalSerializers, serializeIcu } from './serialize';
import { ICUVariablesMapFromTemplate, SerializationResult } from './typings';

type RequiredButUndefinedPossible<T extends {}> = {
  [K in keyof T]: T[K] | undefined;
};
type NeverIfObjectHasNoProperties<T extends {}> = {} extends T ? never : T;

type EntitiesOfMessage<Message extends string, Values extends { [key: string]: any } = {}> = string extends Message
  ? { [key: string]: any } & {
      how_to_add_autocomplete_and_strict_types_checking_for_nanointl?: 'http://github.com/phytonmk/nanointl/#strict-typings';
    }
  : NeverIfObjectHasNoProperties<RequiredButUndefinedPossible<ICUVariablesMapFromTemplate<Message, Values>>>;

export type FormatMessage<Messages extends { [messageId: string]: string }> = <
  MessageKey extends keyof Messages,
  Values extends EntitiesOfMessage<Messages[MessageKey], Values>,
>(
  messageId: MessageKey,
  values?: Values,
) => SerializationResult<Values> &
  (<MessageKey extends keyof Messages>(
    messageId: EntitiesOfMessage<Messages[MessageKey], {}> extends never ? MessageKey : never,
  ) => string);

export type NanointlPlugin<Params = unknown> = {
  name: string;
  init: (options: {
    addParser: (token: string, parser: ExternalParser<Params>) => void;
    addSerializer: (token: string, serializer: ExternalSerializer<Params>) => void;
    addPostParser: (postParser: PostParser<AstNode[], AstNode[]>) => void;
  }) => void;
};

export type MakeIntlOptions = {
  verboseParsing?: { [variableName: string]: any };
  disableCache?: boolean;
  plugins?: NanointlPlugin<any>[];
};

export type IntlInstance<
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
> = {
  formatMessage: FM;
  clearCache: () => void;
};

type Cache = { s: Map<any, Cache>; w: WeakMap<any, Cache>; v: string | undefined };
const getFromCache = <T = unknown>(cache: Cache, path: any[]): T => {
  if (!cache) return cache;
  if (path.length === 0) return cache.v as T;
  if (typeof path[0] === 'object' && path[0] !== null) return getFromCache(cache?.w.get(path[0]) as Cache, path.slice(1));
  return getFromCache(cache?.s.get(path[0]) as Cache, path.slice(1));
};
const addToCache = <T>(cache: Cache, path: any[], value: T): T => {
  if (path.length === 0) return (cache.v = value);
  const pathHeadIsObject = typeof path[0] === 'object' && path[0] !== null;
  const nextCacheNode = pathHeadIsObject ? cache.w.get(path[0]) : cache.s.get(path[0]);
  if (!nextCacheNode) {
    if (pathHeadIsObject) cache.w.set(path[0], { s: new Map(), w: new WeakMap(), v: undefined });
    else cache.s.set(path[0], { s: new Map(), w: new WeakMap(), v: undefined });
  }
  return addToCache((pathHeadIsObject ? cache.w.get(path[0]) : cache.s.get(path[0]))!, path.slice(1), value);
};

export const makeIntl = <
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
>(
  locale: string,
  messages: Messages,
  options?: MakeIntlOptions,
): IntlInstance<Messages, FM> => {
  const astStore: { [messageId: string]: AstNode[] } = {};
  const cache: Cache = { s: new Map(), w: new WeakMap(), v: undefined };
  const externalParsers: ExternalParsers = {};
  const externalSerializers: ExternalSerializers = {};
  const postParsers: PostParser<AstNode[], AstNode[]>[] = [];

  for (const plugin of options?.plugins ?? []) {
    try {
      plugin.init({
        addParser: (token, parser) => (externalParsers[token] = parser),
        addSerializer: (token, serializer) => (externalSerializers[token] = serializer),
        addPostParser: (postParser) => {
          postParsers.push(postParser);
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error ocurred during "${plugin.name}" init call:`);
      throw err;
    }
  }

  const parsingOptions: ParseIcuOptions = {
    externalParsers,
    verboseParsing: options?.verboseParsing,
    postParsers,
  };
  for (const messageId in messages) {
    astStore[messageId] = parseIcu(messages[messageId], parsingOptions);
  }

  const intlBase = makeIntlBase(locale);
  return {
    formatMessage: ((messageId, values) => {
      if (!(messageId in astStore)) {
        return String(messageId);
      }
      const cachePath = [messageId, ...Object.values(values ?? {})];
      const cached = getFromCache(cache, cachePath);
      if (cached) return cached;
      const ast = astStore[messageId as keyof typeof astStore];
      const result = serializeIcu(ast, values ?? {}, intlBase, {
        externalSerializers,
        original: messages[messageId],
      });
      if (options?.disableCache) return result;
      return addToCache(cache, cachePath, result);
    }) as FM,
    clearCache: () => {
      cache.s = new Map();
      cache.w = new WeakMap();
      cache.v = undefined;
    },
  };
};
