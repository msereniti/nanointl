type MarkdownNode =
  | {
      type: 'md-token';
      token: 'emphasis';
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'strong';
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'code';
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'block-code';
      meta: string;
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'link';
      url: string;
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'image';
      url: string;
      size?: { width: number; height: number };
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'heading';
      level: number;
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'list';
      ordered: boolean;
      level: number;
      children: MarkdownAstNode[][];
    }
  | {
      type: 'md-token';
      token: 'quote';
      children: MarkdownAstNode[];
    }
  | {
      type: 'md-token';
      token: 'block';
      children: MarkdownAstNode[];
    };
export type MarkdownAstNode = string | MarkdownNode;
export type MarkdownParsingStore = {
  parentAstChain: MarkdownAstNode[][];
  parentsChain: MarkdownAstNode[];
  ast: MarkdownAstNode[];
  escaping: boolean;
};

const symbolToInlineToken = {
  _: 'emphasis',
  '*': 'strong',
  '`': 'code',
} as const;
const inlineTokeSymbolsDuplicatesAllowed: { [symbol: string]: true } = {
  _: true,
  '*': true,
} as const;
const blockTokens: Partial<{ [token in MarkdownNode['token']]: true }> = {
  'block-code': true,
  image: true,
  heading: true,
  list: true,
  quote: true,
  block: true,
};

export const makeMarkdownParsingExternalStore = (): MarkdownParsingStore => ({
  parentAstChain: [],
  parentsChain: [],
  ast: [],
  escaping: false,
});

export const markdownChunkParser = (message: string, externalStore?: MarkdownParsingStore): MarkdownAstNode[] | undefined => {
  const store: MarkdownParsingStore = externalStore ?? makeMarkdownParsingExternalStore();
  let codeCollecting = false;
  let codeMetaCollecting = false;
  let spacingSkip = false;
  let currentAstPart: MarkdownAstNode | null = null;

  codeCollecting = false;
  codeMetaCollecting = false;

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
    const prevChar = message[i - 1];
    const nextChar = message[i + 1];

    const currentEscaping = store.escaping;
    if (char === "'") {
      store.escaping = !store.escaping;
      if (message[i - 1] !== "'") {
        continue;
      }
    }

    if (currentAstPart === null) {
      const prevAstPart = store.ast[store.ast.length - 1];
      if (prevAstPart && typeof prevAstPart !== 'string' && blockTokens[prevAstPart.token]) {
        currentAstPart = { type: 'md-token', token: 'block', children: [] };
        pushCurrentPartToAst();
        store.parentsChain.push(currentAstPart);
        store.parentAstChain.push(store.ast);
        store.ast = currentAstPart.children;
        currentAstPart = '';
      } else {
        currentAstPart = '';
      }
    }
    if (typeof currentAstPart === 'string') {
      if (currentEscaping) {
        currentAstPart += char;
        continue;
      }
      let inlineToken = false;
      for (const symbol in symbolToInlineToken) {
        if (char === symbol) {
          inlineToken = true;
          if (inlineTokeSymbolsDuplicatesAllowed[symbol] && nextChar === symbol) continue;
          const token = symbolToInlineToken[symbol as keyof typeof symbolToInlineToken];
          const parent = store.parentsChain[store.parentsChain.length - 1];
          if (typeof parent !== 'string' && parent?.token === token) {
            pushCurrentPartToAst();
            store.parentsChain.pop();
            if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
            currentAstPart = null;
          } else {
            pushCurrentPartToAst();
            const newAstPart: MarkdownNode = { type: 'md-token', token, children: [] };
            currentAstPart = newAstPart;
            pushCurrentPartToAst();
            store.parentsChain.push(newAstPart);
            store.parentAstChain.push(store.ast);
            store.ast = newAstPart.children as MarkdownAstNode[];
            currentAstPart = null;
          }
          continue;
        }
      }
      if (!inlineToken) {
        if (char === ' ' && spacingSkip) continue;
        if (spacingSkip) spacingSkip = false;
        if (codeMetaCollecting) {
          if (char === '\n') {
            codeMetaCollecting = false;
            codeCollecting = true;
          } else {
            currentAstPart.meta += char;
          }
        }
        if (codeCollecting) currentAstPart += char;
        if (char === '\n' && nextChar === '\n') continue;
        if (char === '\n' && prevChar === '\n') {
          const parent = store.parentsChain[store.parentsChain.length - 1];

          if (parent && typeof parent !== 'string' && blockTokens[parent.token]) {
            pushCurrentPartToAst();
            store.parentsChain.pop();
            if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
            currentAstPart = null;
          } else {
            currentAstPart = { type: 'md-token', token: 'block', children: [currentAstPart!] };
            pushCurrentPartToAst();
            currentAstPart = null;
          }
        } else if (char === '>') {
          const parent = store.parentsChain[store.parentsChain.length - 1];
          if (parent && typeof parent !== 'string' && parent.token === 'block') {
            (parent as MarkdownNode).token = 'quote';
            spacingSkip = true;
          } else if (prevChar === undefined) {
            currentAstPart = { type: 'md-token', token: 'quote', children: [currentAstPart!] };
            pushCurrentPartToAst();
            currentAstPart = null;
          }
        } else if (
          (prevChar === '\n' || prevChar === undefined) &&
          char === '`' &&
          nextChar === '`' &&
          message[i + 2] === '`' &&
          (message[i + 3] === ' ' || message[i + 3] === '\n')
        ) {
          // i = i + 2;
          continue;
        } else {
          currentAstPart += char;
        }
      }
    } else {
      // if (char === '\n' && nextChar === '\n') continue;
      // if (char === '\n' && prevChar === '\n') {
      //   if (currentAstPart.token !== 'block') {
      //     pushCurrentPartToAst();
      //     currentAstPart = { type: 'md-token', token: 'block', children: [] };
      //   }
      // }
    }
    // else currentAstPart += char;
  }

  pushCurrentPartToAst();
  if (!externalStore) return store.parentAstChain.pop() ?? store.ast;
};

export const postParse = (icuAst: AstNode[]) => {
  const store = makeMarkdownParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') markdownChunkParser(node, store);
    else {
      if ('options' in node) {
        const options = {};
        for (const option in node.options) {
          options[option] = postParse(node.options[option]);
        }
        store.ast.push({ ...node, options });
      } else {
        store.ast.push(node);
      }
    }
  }

  return store.ast;
};

export const preSerialize = (ast, renderers) =>
  ast.map((node) => {
    if (typeof node === 'string') return node;
    if ('options' in node) {
      const options = {};
      for (const option in node.options) {
        options[option] = preSerialize(node.options[option], renderers);
      }
      return { ...node, options };
    }
    if (node.type !== 'md-token') return node;
    node.children = preSerialize(node.children, renderers);
    if (typeof renderers[node.token] !== 'function') {
      throw new Error(`Render function for token "${node.token}" was not provided`);
    }
    return renderers[node.token](node);
  });
