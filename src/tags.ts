import { AstNode } from './parse';

type TagNode = {
  type: 'tag';
  tag: string;
  children: TagsAstNode[];
};
export type TagsAstNode = string | TagNode;
export type TagsParsingStore = {
  parentAstChain: TagsAstNode[][];
  ast: TagsAstNode[];
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
        type: 'tag',
        tag: '',
        children: [],
      };
    } else {
      if (currentAstPart === null) currentAstPart = '';
      if (typeof currentAstPart === 'string') currentAstPart += char;
      if (typeof currentAstPart === 'object' && currentAstPart.type === 'tag') {
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
            store.parentAstChain.push(store.ast);
            store.ast = currentAstPart.children;
          } else {
            const prevChar = message[i - 1];
            const singleTag = prevChar === '/';
            if (!singleTag) {
              const parentTag = store.tagsChain.pop();
              if (parentTag?.tag !== currentAstPart?.tag) {
                throw new Error(`Wrong order of tags: got "${currentAstPart.tag}" on closing of "${parentTag?.tag}"`);
              }
              store.ast.pop();
              if (store.parentAstChain.length > 0) store.ast = store.parentAstChain.pop()!;
            }
          }
          currentAstPart = null;
        } else {
          currentAstPart.tag += char;
        }
      }
    }
  }

  pushCurrentPartToAst();
  if (!externalStore) return store.parentAstChain.pop() ?? store.ast;
};

// type ModifiedAstNode = {};

export const postParse = (icuAst: AstNode[]) => {
  const store = makeTagsParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') tagsChunkParser(node, store);
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
    if (node.type !== 'tag') return node;
    node.children = preSerialize(node.children, renderers);
    if (typeof renderers[node.tag] !== 'function') {
      throw new Error(`Render function for tag "${node.tag}" was not provided`);
    }
    return renderers[node.tag](node.children);
  });
