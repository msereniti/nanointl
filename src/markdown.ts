import { NanointlPlugin } from './makeIntl';

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
  ast: MarkdownAstNode[];
  escaping: boolean;
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
  escaping: false,
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

    const currentEscaping = store.escaping;
    if (char === "'") {
      store.escaping = !store.escaping;
      if (message[i - 1] !== "'") {
        continue;
      }
    }

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
    if (currentEscaping) {
      currentAstPart += char;
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
          store.parentAstChain.push(store.ast);
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
      store.parentAstChain.push(store.ast);
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

export const postParse = (icuAst: AstNode[]) => {
  const store = makeMarkdownParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') markdownChunkParser(node, store);
    else if (node.data?.children) {
      store.ast.push({ ...node, data: { ...node.data, children: postParse(node.data.children) } });
    } else if (node.type === 'select') {
      const options = {};
      for (const option in node.options) {
        options[option] = postParse(node.options[option]);
      }
      store.ast.push({ ...node, options });
    } else if (node.type === 'plural') {
      const options = { exacts: {} };
      for (const option in node.options) {
        if (option === 'exacts') {
          for (const exact in node.options.exacts) {
            options.exacts[exact] = postParse(node.options.exacts[exact]);
          }
        } else {
          options[option] = postParse(node.options[option]);
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
      value({ children: serializeNested(children), ...otherProps }),
    );
    options.addPostParser(postParse);
  },
};
