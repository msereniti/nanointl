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
      token: 'blockCode';
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
  parentsChain: MarkdownNode[];
  nesting: MarkdownNode['token'][];
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
const blockTokens: Partial<{ [token in MarkdownNode['token']]: true }> = {
  blockCode: true,
  image: true,
  heading: true,
  list: true,
  quote: true,
  block: true,
};

export const makeMarkdownParsingExternalStore = (): MarkdownParsingStore => ({
  parentAstChain: [],
  parentsChain: [],
  nesting: [],
  ast: [],
  escaping: false,
});

export const markdownChunkParser = (message: string, externalStore?: MarkdownParsingStore): MarkdownAstNode[] | undefined => {
  const store: MarkdownParsingStore = externalStore ?? makeMarkdownParsingExternalStore();
  let codeCollecting = false;
  let codeMetaCollecting = false;
  let spacingSkip = false;
  let quoteMarkerSkip = false;
  const hasTopLevelBlocks = false;
  let linkUrlCollecting = false;
  let nesting: MarkdownNode['token'][] = [];
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
  // const initiateBlock = () => {
  //   if (nesting.length === 0) {
  //     hasTopLevelBlocks = true;
  //   }
  //   if (nesting.length === 0) {
  //     nesting.push('block');
  //   }

  //   store.ast = store.parentAstChain[0] ?? store.ast;
  //   store.parentAstChain = [];
  //   store.parentsChain = [];

  //   console.log(nesting);

  //   for (let i = 0; i < nesting.length; i++) {
  //     const lastNode = store.ast[store.ast.length - 1];
  //     console.log(lastNode);

  //     if (typeof lastNode === 'object' && lastNode.token === nesting[i]) {
  //       store.parentAstChain.push(store.ast);
  //       store.parentsChain.push(lastNode);
  //       // if (store.ast.some((child) => typeof child === 'object' && blockTokens[child.token])) {
  //       //   nesting.push('block');
  //       // }
  //       store.ast = lastNode.children;
  //     } else {
  //       currentAstPart = { type: 'md-token', token: nesting[i], children: [currentAstPart!] };
  //       store.parentAstChain.push(store.ast);
  //       store.parentsChain.push(currentAstPart);
  //       pushCurrentPartToAst();
  //       store.ast = `currentAstPart`.children;
  //     }
  //   }

  //   store.ast = store.parentAstChain[0] ?? store.ast;
  //   pushCurrentPartToAst();

  //   store.parentAstChain = [];
  //   store.parentsChain = [];
  //   nesting = [];
  //   currentAstPart = null;
  // };

  // const initiateBlock = () => {
  //   if (nesting.length === 0) {
  //     hasTopLevelBlocks = true;
  //   }
  //   const lastNode = store.ast[store.ast.length - 1];
  //   // if (lastNode && typeof lastNode === 'object' && blockTokens[lastNode.token] && typeof currentAstPart === 'string') {
  //   //   console.log(nesting, lastNode, store.ast);
  //   // }
  //   if (nesting.length === 0) {
  //     nesting.push('block'); // maybe it also should be pushed on depth reducing?
  //   }
  //   // console.log(nesting, store);

  //   if (currentAstPart === 'f') {
  //     nesting.push('block');
  //   }

  //   if (currentAstPart === 'e') {
  //     // nesting.push('block');
  //     // console.log(nesting);
  //     // nesting = ['block', 'quote'];
  //     // store.nesting = nesting;
  //   }

  //   const initDepth = store.nesting.length;

  //   store.ast = store.parentAstChain[0] ?? store.ast;
  //   store.parentAstChain = [];
  //   store.parentsChain = [];

  //   // if (store.nesting.length > nesting.length) {
  //   //   nesting.push('block');
  //   // }
  //   for (let i = 0; i < nesting.length; i++) {
  //     const lastNode = store.ast[store.ast.length - 1];
  //     if (!lastNode || typeof lastNode === 'string') break;
  //     if (lastNode.token === nesting[i]) {
  //       store.parentAstChain.push(store.ast);
  //       store.parentsChain.push(lastNode);
  //       store.ast = lastNode.children;
  //     } else {
  //       store.nesting = nesting;
  //       break;
  //     }
  //   }
  //   if (nesting.length !== store.nesting.length) {
  //     if (store.ast.some((child) => typeof child === 'string')) {
  //       store.ast.splice(0, store.ast.length, { type: 'md-token', token: 'block', children: [...store.ast] });
  //     }
  //   }
  //   if (nesting.length === store.nesting.length && store.nesting.length === initDepth) {
  //     store.parentAstChain.pop();
  //     store.parentsChain.pop();
  //     currentAstPart = { type: 'md-token', token: nesting[nesting.length - 1], children: [currentAstPart!] };
  //     pushCurrentPartToAst();
  //     currentAstPart = null;
  //   }

  //   for (let i = store.nesting.length; i < nesting.length; i++) {
  //     if (!currentAstPart) break;
  //     currentAstPart = { type: 'md-token', token: nesting[i]!, children: [currentAstPart!] } as MarkdownAstNode;
  //     // store.parentsChain.push(currentAstPart);
  //     // store.parentAstChain.push(store.ast);
  //     // store.ast = currentAstPart.children as MarkdownAstNode[];
  //     store.nesting.push(nesting[i]);
  //   }
  //   pushCurrentPartToAst();
  //   currentAstPart = null;

  //   nesting = [];
  //   currentAstPart = null;
  // };

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
      // const prevAstPart = store.ast[store.ast.length - 1];
      // if (prevAstPart && typeof prevAstPart !== 'string' && blockTokens[prevAstPart.token]) {
      //   currentAstPart = { type: 'md-token', token: 'block', children: [] };
      //   pushCurrentPartToAst();
      //   store.parentsChain.push(currentAstPart);
      //   store.parentAstChain.push(store.ast);
      //   store.ast = currentAstPart.children;
      //   currentAstPart = '';
      // } else {
      currentAstPart = '';
      // }
    }

    if (linkUrlCollecting) {
      if (currentAstPart.url === '' && char === '(') continue;
      if (char === ')') {
        linkUrlCollecting = false;
        currentAstPart = null;
        continue;
      } else {
        currentAstPart.url += char;
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

    if (char === ' ' && spacingSkip) continue;
    if (char === '>' && quoteMarkerSkip) {
      nesting.push('quote');
      continue;
    }
    if (spacingSkip) spacingSkip = false;
    if (quoteMarkerSkip) quoteMarkerSkip = false;
    if (codeMetaCollecting) {
      if (char === '\n') {
        codeMetaCollecting = false;
        codeCollecting = true;
      } else {
        currentAstPart.meta += char;
      }
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
        if (parent?.token === token) {
          pushCurrentPartToAst();
          store.parentsChain.pop();
          if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
          currentAstPart = null;
        } else {
          pushCurrentPartToAst();
          currentAstPart = { type: 'md-token', token, children: [] };
          pushCurrentPartToAst();
          store.parentsChain.push(currentAstPart);
          store.parentAstChain.push(store.ast);
          store.ast = currentAstPart.children as MarkdownAstNode[];
          currentAstPart = null;
        }
        inlineToken = true;
      }
    }
    if (char === '[') {
      // pushCurrentPartToAst();
      // currentAstPart = { type: 'md-token', token: 'link', url: '', children: [] };
      // linkUrlCollecting = true;

      pushCurrentPartToAst();
      currentAstPart = { type: 'md-token', token: 'link', url: '', children: [] };
      pushCurrentPartToAst();
      store.parentsChain.push(currentAstPart);
      store.parentAstChain.push(store.ast);
      store.ast = currentAstPart.children as MarkdownAstNode[];
      currentAstPart = null;
      continue;
    }
    if (inlineToken) continue;

    if (char === ']' && store.parentsChain[store.parentsChain.length - 1]?.token === 'link') {
      if (nextChar !== '(' || message[i + 2] === ')') {
        const node = store.parentsChain[store.parentsChain.length - 1];
        store.parentAstChain[store.parentAstChain.length - 1].pop();
        store.ast = store.parentAstChain[store.parentAstChain.length - 1];
        const children = ['[', ...node.children, currentAstPart, ']'];
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
    if (char === '\n' && prevChar === '\n') {
      initiateBlock();
      continue;
      // const prevAstPart = store.ast[store.ast.length - 1];
      // if (prevAstPart === undefined) {
      //   currentAstPart = { type: 'md-token', token: 'block', children: [currentAstPart!] };
      //   store.parentsChain.push(currentAstPart);
      //   pushCurrentPartToAst();
      // }
    }
    if (char === '>' && (prevChar === undefined || prevChar === '\n')) {
      nesting = ['quote'];
      spacingSkip = true;
      quoteMarkerSkip = true;
      continue;
    }
    // if (char === '\n' && prevChar === '\n') {
    //   // const parent = store.parentsChain[store.parentsChain.length - 1];
    //   // nestingDepth = Math.max(nestingDepth, 1);
    //   const depthChanged = nestingDepth !== store.nestingDepth;
    //   console.log(currentAstPart, nestingDepth, store.nestingDepth);
    //   // if (parent && nestingDepth < store.nestingDepth) {
    //   //   pushCurrentPartToAst();
    //   // }
    //   while (nestingDepth < store.nestingDepth) {
    //     store.parentsChain.pop();
    //     store.ast = store.parentAstChain.pop()!;
    //     store.nestingDepth--;
    //   }

    //   while (nestingDepth > store.nestingDepth) {
    //     currentAstPart = { type: 'md-token', token: 'block', children: [currentAstPart!] };
    //     store.nestingDepth++;
    //   }
    //   if (depthChanged) {
    //     pushCurrentPartToAst();
    //   }
    //   // if (parent && typeof parent !== 'string' && blockTokens[parent.token] && goingUp) {
    //   //   pushCurrentPartToAst();
    //   //   store.parentsChain.pop();
    //   //   if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
    //   // } else {
    //   //   currentAstPart = { type: 'md-token', token: 'block', children: [currentAstPart!] };
    //   //   store.nestingDepth.push(nestingDepth);
    //   //   pushCurrentPartToAst();
    //   // }
    //   currentAstPart = null;
    //   nestingDepth = 1;
    //   continue;
    // }

    // if (char === '>' && (currentAstPart.length === 0 || prevChar === '\n')) {
    //   nestingDepth++;
    //   const parent = store.parentsChain[store.parentsChain.length - 1];
    //   if (
    //     parent &&
    //     typeof parent !== 'string' &&
    //     (parent.token === 'block' || parent.token === 'quote') &&
    //     parent.children.length === 0
    //   ) {
    //     (parent as MarkdownNode).token = 'quote';
    //     spacingSkip = true;
    //     quoteMarkerSkip = true;
    //     currentAstPart = null;

    //     continue;
    //   } else {
    //     currentAstPart = { type: 'md-token', token: 'quote', children: [currentAstPart!] };
    //     pushCurrentPartToAst();
    //     store.parentsChain.push(currentAstPart);
    //     store.parentAstChain.push(store.ast);
    //     store.ast = currentAstPart.children;
    //     currentAstPart = null;
    //     spacingSkip = true;
    //     quoteMarkerSkip = true;
    //     continue;
    //   }
    // }
    // if (
    //   (prevChar === '\n' || prevChar === undefined) &&
    //   char === '`' &&
    //   message[i + 1] === '`' &&
    //   message[i + 2] === '`' &&
    //   (message[i + 3] === ' ' || message[i + 3] === '\n' || message[i + 3] === undefined)
    // ) {
    //   // if (codeCollecting) {
    //   //   currentAstPart = null;
    //   //   codeCollecting = false;
    //   // } else {
    //   // if (parent && typeof parent !== 'string' && parent.token === 'block') {

    //   pushCurrentPartToAst();
    //   currentAstPart = { type: 'md-token', token: 'blockCode', meta: '', children: [] };
    //   pushCurrentPartToAst();
    //   store.parentsChain.push(currentAstPart);
    //   store.parentAstChain.push(store.ast);
    //   store.ast = currentAstPart.children;
    //   // pushCurrentPartToAst();
    //   // currentAstPart = null;
    //   // codeCollecting = true;
    //   // }

    //   i += 2;
    //   continue;
    // }

    currentAstPart += char;
  }

  if (hasTopLevelBlocks || nesting.length !== 0) {
    initiateBlock();
  } else {
    pushCurrentPartToAst();
  }
  // pushCurrentPartToAst();
  if (!externalStore) return store.parentAstChain[0] ?? store.ast;
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
