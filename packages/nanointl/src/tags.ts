import { NanointlPlugin } from './makeIntl';
import { AstNode, PostParser } from './parse';
import { ExternalSerializer } from './serialize';
import {
  UnwrapLinkedSleeve,
  LinkedSleeveNexusLimit,
  Increment,
  Decrement,
  ICUVariablesMapFromTemplate,
  SerializationResult,
} from './typings';

type TagNode = {
  type: 'external';
  name: 'tag';
  variableName: string;
  data: { children: TagsAstNode[] };
};
export type TagsAstNode = string | TagNode;
export type TagsParsingStore = {
  parentAstChain: TagsAstNode[][];
  ast: (TagsAstNode | AstNode)[];
  tagsChain: TagNode[];
  escaping: boolean;
};

export const makeTagsParsingExternalStore = (): TagsParsingStore => ({
  parentAstChain: [],
  ast: [],
  tagsChain: [],
  escaping: false,
});

export const tagsChunkParser = (message: string, externalStore?: TagsParsingStore): TagsAstNode[] | undefined => {
  const store: TagsParsingStore = externalStore ?? makeTagsParsingExternalStore();
  let closingTag = false;
  let tagAttrsSkip = false;
  let currentAstPart: TagsAstNode | null = null;

  const pushCurrentPartToAst = () => {
    if (currentAstPart) {
      if (typeof currentAstPart === 'string' && typeof store.ast[store.ast.length - 1] === 'string') {
        store.ast[store.ast.length - 1] += currentAstPart;
      } else {
        store.ast.push(currentAstPart);
      }
    }
  };

  for (let i = 0; i < message.length; i++) {
    const char = message[i];

    if (tagAttrsSkip && char !== '>') {
      continue;
    }

    const currentEscaping = store.escaping;
    if (char === "'") {
      store.escaping = !store.escaping;
      if (message[i - 1] !== "'") {
        continue;
      }
    }

    if (char === '<' && !currentEscaping) {
      closingTag = false;
      pushCurrentPartToAst();
      currentAstPart = {
        type: 'external',
        name: 'tag',
        variableName: '',
        data: { children: [] },
      };
    } else {
      if (currentAstPart === null) currentAstPart = '';
      if (typeof currentAstPart === 'string') currentAstPart += char;
      if (typeof currentAstPart === 'object' && currentAstPart.name === 'tag') {
        if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
          tagAttrsSkip = true;
          continue;
        } else if (char === '/') {
          closingTag = true;
        } else if (char === '>') {
          tagAttrsSkip = false;
          pushCurrentPartToAst();
          if (!closingTag) {
            store.tagsChain.push(currentAstPart);
            store.parentAstChain.push(store.ast as TagsAstNode[]);
            store.ast = currentAstPart.data.children;
          } else {
            const prevChar = message[i - 1];
            const singleTag = prevChar === '/';
            if (!singleTag) {
              const parentTag = store.tagsChain.pop();
              if (parentTag?.variableName !== currentAstPart?.variableName) {
                throw new Error(
                  `Wrong order of tags: got "${currentAstPart.variableName}" on closing of "${parentTag?.variableName}"`,
                );
              }
              store.ast.pop();
              if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
            }
          }
          currentAstPart = null;
        } else {
          currentAstPart.variableName += char;
        }
      }
    }
  }

  pushCurrentPartToAst();
  if (!externalStore) return store.parentAstChain[0] ?? store.ast;
};

export const tagsPostParser: PostParser<AstNode[], AstNode[]> = (icuAst: AstNode[]) => {
  const store = makeTagsParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') tagsChunkParser(node, store);
    else if (node.type === 'select') {
      const options: typeof node.options = {};
      for (const option in node.options) {
        options[option as keyof typeof options] = tagsPostParser(node.options[option]) as AstNode[];
      }
      store.ast.push({ ...node, options });
    } else if (node.type === 'plural') {
      const options: typeof node.options = { exacts: {} };
      for (const option in node.options) {
        if (option === 'exacts') {
          for (const exact in node.options.exacts) {
            options.exacts![exact] = tagsPostParser(node.options.exacts[exact]) as AstNode[];
          }
        } else {
          options[option as Exclude<keyof typeof options, 'exacts'>] = tagsPostParser(
            node.options[option as keyof typeof options] as AstNode[],
          ) as AstNode[];
        }
      }
      store.ast.push({ ...node, options });
    } else {
      store.ast.push(node);
    }
  }

  return store.ast as AstNode[];
};

export const tagsPostSerializer: ExternalSerializer<{ children: AstNode[] }> = (
  params,
  value,
  _intl,
  serializeNested,
  node,
  values,
) => {
  const variableName = (node as { variableName: string })?.variableName;
  if (!value) {
    if (values.tagsFallback) value = values.tagsFallback;
    else throw new Error(`Serializer for "${variableName}" was not provided`);
  }
  const renderChildren = value as (params: { children: unknown; tag: string }) => string;
  return renderChildren?.({ children: serializeNested(params?.children ?? []), tag: variableName });
};

export const tagsPlugin: NanointlPlugin<any> = {
  name: 'tags-plugin',
  init(options) {
    options.addSerializer('tag', tagsPostSerializer);
    options.addPostParser(tagsPostParser as PostParser<AstNode[], AstNode[]>);
  },
};

type TraverseTagContent<
  TagName extends string,
  Template extends string,
  Depth extends number = 0,
  NexusLength extends number = 0,
  Escaping extends boolean = false,
> = NexusLength extends LinkedSleeveNexusLimit
  ? { next: UnwrapLinkedSleeve<TraverseTagContent<TagName, Template, Depth, 0, Escaping>> }
  : Template extends `${infer Char}${infer Rest}`
  ? Escaping extends false
    ? Char extends "'"
      ? Rest extends `'${infer Rest}`
        ? ["'", TraverseTagContent<TagName, Rest, Depth, Increment<NexusLength>, Escaping>]
        : TraverseTagContent<TagName, Rest, Depth, Increment<NexusLength>, true>
      : Template extends `<${TagName}>${infer Rest}`
      ? [`<${TagName}>`, TraverseTagContent<TagName, Rest, Increment<Depth>, Increment<NexusLength>, Escaping>]
      : Template extends `<${TagName} ${infer TagAttributes}>${infer Rest}`
      ? [`<${TagName} ${TagAttributes}>`, TraverseTagContent<TagName, Rest, Increment<Depth>, Increment<NexusLength>, Escaping>]
      : Template extends `</${TagName}>${infer Rest}`
      ? Depth extends 0
        ? []
        : [`</${TagName}>`, TraverseTagContent<TagName, Rest, Decrement<Depth>, Increment<NexusLength>, Escaping>]
      : [Char, TraverseTagContent<TagName, Rest, Depth, Increment<NexusLength>, Escaping>]
    : Char extends "'"
    ? TraverseTagContent<TagName, Rest, Depth, Increment<NexusLength>, false>
    : [Char, TraverseTagContent<TagName, Rest, Depth, Increment<NexusLength>, Escaping>]
  : [];

type ExtractTagChildrenContent<
  TagName extends string,
  Template extends string,
  Result = UnwrapLinkedSleeve<TraverseTagContent<TagName, Template>>[0],
> = Result extends string ? Result : '';

type ChildrenSerializationResults<
  Template extends string,
  Values extends {} = {},
> = keyof ICUVariablesMapFromTemplate<Template> extends keyof Values
  ? SerializationResult<Pick<Values, keyof ICUVariablesMapFromTemplate<Template>>>
  : any;

type TagsParser<Template extends string, Values extends {} = {}> = Template extends `${string}<${infer TagInner}>${infer After}`
  ? TagInner extends `/${string}`
    ? TagsParser<After>
    : TagInner extends `${infer TagName} ${string}`
    ? {
        vars: [
          {
            name: TagName;
            type: (props: { children: ChildrenSerializationResults<ExtractTagChildrenContent<TagName, After>, Values> }) => any;
          },
          ...TagsParser<After>['vars'],
        ];
      }
    : TagInner extends `${infer TagName}/`
    ? {
        vars: [
          {
            name: TagName;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: () => any;
          },
          ...TagsParser<After>['vars'],
        ];
      }
    : {
        vars: [
          {
            name: TagInner;
            type: (props: { children: ChildrenSerializationResults<ExtractTagChildrenContent<TagInner, After>, Values> }) => any;
          },
          ...TagsParser<After>['vars'],
        ];
      }
  : { vars: [] };

declare global {
  // @ts-ignore
  interface NanointlOverallParsers<Template extends string, Values extends {} = {}> {
    tags: TagsParser<Template, Values>;
  }
}
