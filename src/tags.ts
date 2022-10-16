import { NanointlPlugin } from './makeIntl';
import { AstNode } from './parse';

type TagNode = {
  type: 'external';
  name: 'tag';
  variableName: string;
  data: { children: TagsAstNode[] };
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
            store.parentAstChain.push(store.ast);
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

// type ModifiedAstNode = {};

export const tagsPostParser = (icuAst: AstNode[]) => {
  const store = makeTagsParsingExternalStore();

  for (const node of icuAst) {
    if (typeof node === 'string') tagsChunkParser(node, store);
    else if (node.type === 'select') {
      const options = {};
      for (const option in node.options) {
        options[option] = tagsPostParser(node.options[option]);
      }
      store.ast.push({ ...node, options });
    } else if (node.type === 'plural') {
      const options = { exacts: {} };
      for (const option in node.options) {
        if (option === 'exacts') {
          for (const exact in node.options.exacts) {
            options.exacts[exact] = tagsPostParser(node.options.exacts[exact]);
          }
        } else {
          options[option] = tagsPostParser(node.options[option]);
        }
      }
      store.ast.push({ ...node, options });
    } else {
      store.ast.push(node);
    }
  }

  return store.ast;
};

export const tagsPostSerializer = ({ children }, value, _intl, serializeNested, node, values) => {
  if (!value) {
    if (values.tagsFallback) value = values.tagsFallback;
    else throw new Error(`Serializer for "${node.variableName}" was not provided`);
  }
  return value({ children: serializeNested(children), tag: node.variableName });
};

export const tagsPlugin: NanointlPlugin<any> = {
  name: 'tags-plugin',
  init(options) {
    options.addSerializer('tag', tagsPostSerializer);
    options.addPostParser(tagsPostParser);
  },
};

type TagsParser<Template extends string> = Template extends `${string}<${infer TagInner}>${infer After}`
  ? TagInner extends `/${string}`
    ? TagsParser<After>
    : TagInner extends `${infer TagName} ${string}`
    ? { vars: [{ name: TagName; type: ({ children }: { children: unknown }) => unknown }, ...TagsParser<After>['vars']] }
    : TagInner extends `${infer TagName}/`
    ? { vars: [{ name: TagName; type: ({ children }: { children: unknown }) => unknown }, ...TagsParser<After>['vars']] }
    : { vars: [{ name: TagInner; type: ({ children }: { children: unknown }) => unknown }, ...TagsParser<After>['vars']] }
  : { vars: [] };

declare global {
  interface NanointlOverallParsers<Template extends string> {
    tags: TagsParser<Template>;
  }
}
