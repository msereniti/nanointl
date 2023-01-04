import { NanointlPlugin } from './makeIntl';
import { AstNode, PostParser } from './parse';
import {
  Decrement,
  ICUVariablesMapFromTemplate,
  Increment,
  LinkedSleeveNexusLimit,
  SerializationResult,
  UnwrapLinkedSleeve,
} from './typings';

type MarkdownEmphasisNode = {
  type: 'external';
  name: 'md-token';
  variableName: 'emphasis';
  data: {
    children: MarkdownAstNode[];
  };
};
type MarkdownStrongNode = {
  type: 'external';
  name: 'md-token';
  variableName: 'strong';
  data: {
    children: MarkdownAstNode[];
  };
};
type MarkdownCodeNode = {
  type: 'external';
  name: 'md-token';
  variableName: 'code';
  data: {
    children: MarkdownAstNode[];
  };
};
type MarkdownLinkNode = {
  type: 'external';
  name: 'md-token';
  variableName: 'link';
  data: {
    url: string;
    children: MarkdownAstNode[];
  };
};
type MarkdownNode = MarkdownEmphasisNode | MarkdownStrongNode | MarkdownCodeNode | MarkdownLinkNode;
export type MarkdownAstNode = string | MarkdownNode;
export type MarkdownParsingStore = {
  parentAstChain: MarkdownAstNode[][];
  parentsChain: MarkdownNode[];
  nesting: MarkdownNode['variableName'][];
  ast: (MarkdownAstNode | AstNode)[];
};

const symbolToInlineToken = {
  _: 'emphasis',
  '*': 'strong',
  '`': 'code',
} as const;
const inlineTokenSymbolsDuplicatesAllowed: { [symbol: string]: true } = {
  _: true,
  '*': true,
} as const;

export const makeMarkdownParsingExternalStore = (): MarkdownParsingStore => ({
  parentAstChain: [],
  parentsChain: [],
  nesting: [],
  ast: [],
});

export const markdownChunkParser = (message: string, externalStore?: MarkdownParsingStore): MarkdownAstNode[] | undefined => {
  const store: MarkdownParsingStore = externalStore ?? makeMarkdownParsingExternalStore();
  const codeCollecting = false;
  let linkUrlCollecting = false;
  let currentAstPart: MarkdownAstNode | null = null;

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
    const nextChar = message[i + 1];

    if (currentAstPart === null) {
      currentAstPart = '';
    }

    if (linkUrlCollecting) {
      if ((currentAstPart as MarkdownLinkNode).data.url === '' && char === '(') continue;
      if (char === ')') {
        linkUrlCollecting = false;
        currentAstPart = null;
        continue;
      } else {
        (currentAstPart as MarkdownLinkNode).data.url += char;
        continue;
      }
    }
    if (typeof currentAstPart !== 'string') {
      continue;
    }

    if (codeCollecting) currentAstPart += char;

    let inlineToken = false;
    for (const symbol in symbolToInlineToken) {
      if (char === symbol) {
        if (nextChar === symbol) {
          if (inlineTokenSymbolsDuplicatesAllowed[symbol]) {
            inlineToken = true;
            continue;
          } else break;
        }
        const token = symbolToInlineToken[symbol as keyof typeof symbolToInlineToken];
        const parent = store.parentsChain[store.parentsChain.length - 1];
        if (parent?.variableName === token) {
          pushCurrentPartToAst();
          store.parentsChain.pop();
          if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
          currentAstPart = null;
        } else {
          pushCurrentPartToAst();
          currentAstPart = { type: 'external', name: 'md-token', variableName: token, data: { children: [] } } as MarkdownNode;
          pushCurrentPartToAst();
          store.parentsChain.push(currentAstPart);
          store.parentAstChain.push(store.ast as MarkdownAstNode[]);
          store.ast = currentAstPart.data.children as MarkdownAstNode[];
          currentAstPart = null;
        }
        inlineToken = true;
      }
    }
    if (char === '[') {
      pushCurrentPartToAst();
      currentAstPart = { type: 'external', name: 'md-token', variableName: 'link', data: { url: '', children: [] } };
      pushCurrentPartToAst();
      store.parentsChain.push(currentAstPart);
      store.parentAstChain.push(store.ast as MarkdownAstNode[]);
      store.ast = currentAstPart.data.children as MarkdownAstNode[];
      currentAstPart = null;
      continue;
    }
    if (inlineToken) continue;

    if (char === ']' && store.parentsChain[store.parentsChain.length - 1]?.variableName === 'link') {
      if (nextChar !== '(' || message[i + 2] === ')') {
        const node = store.parentsChain[store.parentsChain.length - 1];
        store.parentAstChain[store.parentAstChain.length - 1].pop();
        store.ast = store.parentAstChain[store.parentAstChain.length - 1];
        const children = ['[', ...node.data.children, currentAstPart, ']'];
        for (const child of children) {
          currentAstPart = child;
          pushCurrentPartToAst();
        }
        currentAstPart = null;
        continue;
      }
      pushCurrentPartToAst();
      currentAstPart = store.parentsChain.pop()!;
      store.ast = store.parentAstChain.pop()!;
      linkUrlCollecting = true;
      continue;
    }
    if (char === '\n' && nextChar === '\n') continue;

    currentAstPart += char;
  }

  pushCurrentPartToAst();

  if (!externalStore) return store.parentAstChain[0] ?? store.ast;
};

export const postParse = (icuAst: (AstNode | MarkdownAstNode)[]) => {
  const store = makeMarkdownParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') {
      markdownChunkParser(node, store);
    } else if ('data' in node && node.data?.children) {
      store.ast.push({ ...node, data: { ...node.data, children: postParse(node.data.children) } });
    } else if (node.type === 'select') {
      const options: typeof node.options = {};
      for (const option in node.options) {
        options[option] = postParse(node.options[option]) as AstNode[];
      }
      store.ast.push({ ...node, options });
    } else if (node.type === 'plural') {
      const options: typeof node.options = { exacts: {} };
      for (const option in node.options) {
        if (option === 'exacts') {
          for (const exact in node.options.exacts) {
            options.exacts![exact] = postParse(node.options.exacts[exact]) as AstNode[];
          }
        } else {
          options[option as Exclude<keyof typeof node.options, 'exacts'>] = postParse(
            node.options[option as keyof typeof node.options] as AstNode[],
          ) as AstNode[];
        }
      }
      store.ast.push({ ...node, options });
    } else {
      store.ast.push(node);
    }
  }

  return store.ast;
};

export const markdownPlugin: NanointlPlugin<any> = {
  name: 'markdown-plugin',
  init(options) {
    options.addSerializer('md-token', ({ children, ...otherProps }, value, _intl, serializeNested) =>
      (value as any)?.({ children: serializeNested(children), ...otherProps }),
    );
    options.addPostParser(postParse as PostParser<AstNode[], AstNode[]>);
  },
};

type TraverseTokenContent<
  Token extends string,
  Template extends string,
  Depth extends number = 0,
  NexusLength extends number = 0,
  Escaping extends boolean = false,
> = NexusLength extends LinkedSleeveNexusLimit
  ? { next: UnwrapLinkedSleeve<TraverseTokenContent<Token, Template, Depth, 0, Escaping>> }
  : Template extends `${infer Char}${infer Rest}`
  ? Escaping extends false
    ? Char extends "'"
      ? Rest extends `'${infer Rest}`
        ? ["'", TraverseTokenContent<Token, Rest, Depth, Increment<NexusLength>, Escaping>]
        : TraverseTokenContent<Token, Rest, Depth, Increment<NexusLength>, true>
      : Template extends `${Token}${infer Rest}`
      ? Depth extends 0
        ? []
        : [Token, TraverseTokenContent<Token, Rest, Decrement<Depth>, Increment<NexusLength>, Escaping>]
      : [Char, TraverseTokenContent<Token, Rest, Depth, Increment<NexusLength>, Escaping>]
    : Char extends "'"
    ? TraverseTokenContent<Token, Rest, Depth, Increment<NexusLength>, false>
    : [Char, TraverseTokenContent<Token, Rest, Depth, Increment<NexusLength>, Escaping>]
  : [];

type ExtractTokenChildrenContent<
  Token extends string,
  Template extends string,
  Result = UnwrapLinkedSleeve<TraverseTokenContent<Token, Template>>[0],
> = Result extends string ? Result : '';

type ChildrenSerializationResults<
  Template extends string,
  Values extends {} = {},
> = keyof ICUVariablesMapFromTemplate<Template> extends keyof Values
  ? SerializationResult<Pick<Values, keyof ICUVariablesMapFromTemplate<Template>>>
  : any;

type TokenParser<
  TokenName extends string,
  Token extends string,
  TokenFallback extends string,
  Template extends string,
  Values extends {} = {},
> = Template extends `${string}${Token}${infer After}`
  ? After extends `${string}${Token}${string}`
    ? {
        vars: [
          {
            name: TokenName;
            type: (props: { children: ChildrenSerializationResults<ExtractTokenChildrenContent<Token, After>, Values> }) => any;
          },
          ...TokenParser<TokenName, Token, TokenFallback, After, Values>['vars'],
        ];
      }
    : TokenParser<TokenName, Token, TokenFallback, After, Values>
  : Template extends `${string}${TokenFallback}${infer After}`
  ? After extends `${string}${TokenFallback}${string}`
    ? {
        vars: [
          {
            name: TokenName;
            type: (props: {
              children: ChildrenSerializationResults<ExtractTokenChildrenContent<TokenFallback, After>, Values>;
            }) => any;
          },
          ...TokenParser<TokenName, Token, TokenFallback, After, Values>['vars'],
        ];
      }
    : TokenParser<TokenName, Token, TokenFallback, After, Values>
  : { vars: [] };

type LinkTokenParser<
  Template extends string,
  Values extends {} = {},
> = Template extends `${string}[${infer Content}](${infer Url})${infer After}`
  ? {
      vars: [
        {
          name: 'link';
          type: (props: { url: Url; children: ChildrenSerializationResults<Content, Values> }) => any;
        },
        ...LinkTokenParser<After, Values>['vars'],
      ];
    }
  : { vars: [] };

type MarkdownParser<Template extends string, Values extends {} = {}> = {
  vars: [
    ...TokenParser<'strong', '**', '*', Template, Values>['vars'],
    ...TokenParser<'emphasis', '__', '_', Template, Values>['vars'],
    ...TokenParser<'code', '`', never, Template, Values>['vars'],
    ...LinkTokenParser<Template, Values>['vars'],
  ];
};

declare global {
  // @ts-ignore
  interface NanointlOverallParsers<Template extends string, Values extends {} = {}> {
    markdown: MarkdownParser<Template, Values>;
  }
}
