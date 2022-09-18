import { makeIntlBase } from './intlBase';
import { AstNode, ExternalParser, ExternalParsers, parseIcu, PostParser } from './parse';
import { ExternalSerializer, ExternalSerializers, serializeIcu, PreSerializer } from './serialize';
import { ICUVariablesMapFromTemplate } from './typings';

type RequiredButUndefinedPossible<T extends {}> = {
  [K in keyof T]: T[K] | undefined;
};
type NeverIfObjectHasNoProperties<T extends {}> = {} extends T ? never : T;

type EntitiesOfMessage<Message extends string> = string extends Message
  ? { [key: string]: any } & {
      how_to_add_autocomplete_and_strict_types_checking_for_nanointl?: 'http://github.com/phytonmk/nanointl/#strict-typings';
    }
  : RequiredButUndefinedPossible<NeverIfObjectHasNoProperties<ICUVariablesMapFromTemplate<Message>>>;

export type FormatMessage<Messages extends { [messageId: string]: string }> = <MessageKey extends keyof Messages>(
  messageId: MessageKey,
  values?: EntitiesOfMessage<Messages[MessageKey]>,
) => string;

export type NanointlPlugin<
  Params = unknown,
  // PluginInputAst extends AstNode[] = AstNode[],
  // PluginOutputAst extends AstNode[] = AstNode[],
> = {
  name: string;
  init: (options: {
    addParser: (token: string, parser: ExternalParser<Params>) => void;
    addSerializer: (token: string, serializer: ExternalSerializer<Params>) => void;
    addInnerProcessor: (postParser: PostParser<AstNode[], AstNode[]>, preSerializer: PreSerializer<AstNode[], AstNode[]>) => void;
  }) => void;
};

export type MakeIntlOptions = {
  verboseParsing?: { [variableName: string]: any };
  plugins?: NanointlPlugin<any>[];
};

export type IntlInstance<
  Messages extends { [messageId: string]: string },
  FM extends FormatMessage<Messages> = FormatMessage<Messages>,
> = {
  formatMessage: FM;
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
  const externalParsers: ExternalParsers = {};
  const externalSerializers: ExternalSerializers = {};

  for (const plugin of options?.plugins ?? []) {
    try {
      plugin.init({
        addParser: (token, parser) => (externalParsers[token] = parser),
        addSerializer: (token, serializer) => (externalSerializers[token] = serializer),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error ocurred during "${plugin.name}" init call:`);
      throw err;
    }
  }

  const parsingOptions = {
    externalParsers,
    verboseParsing: options?.verboseParsing,
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
      const ast = astStore[messageId as keyof typeof astStore];
      return serializeIcu(ast, values ?? {}, intlBase, {
        externalSerializers,
        original: messages[messageId],
      });
    }) as FM,
  };
};
