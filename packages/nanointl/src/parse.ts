type VariableNode = {
  type: 'variable';
  name: string;
  offset?: PluralOffset;
  bracketsGroup: number;
};
type PluralNode = {
  type: 'plural';
  cardinal: boolean;
  variable: VariableNode;
  offset?: PluralOffset;
  options: {
    zero?: AstNode[];
    one?: AstNode[];
    two?: AstNode[];
    few?: AstNode[];
    many?: AstNode[];
    other?: AstNode[];
    exacts?: {
      [value: string]: AstNode[];
    };
  };
};
type SelectNode = {
  type: 'select';
  variable: VariableNode;
  options: Record<string, AstNode[]>;
};
type PluralExactValue = {
  type: 'plural-exact-value';
  value: string;
};
type PluralOffset = {
  type: 'plural-offset';
  rawValue: string;
  value: number;
};
type ExternalNode<T = any> = {
  type: 'external';
  name: string;
  optionsPart: boolean;
  variableName: string;
  data: T;
  rawData: string;
};
export type AstNode = string | VariableNode | PluralNode | PluralExactValue | PluralOffset | SelectNode | ExternalNode;

export type ExternalParser<Params = unknown> = (rawData: string, variableName: string, verboseInput?: any) => Params;
export type ExternalParsers<Params = unknown> = {
  [parseName: string]: ExternalParser<Params>;
};

const pluralOptions = ['zero', 'one', 'two', 'few', 'many', 'other'];
const externals = ['number', 'date', 'time'];

export type ParseIcuOptions = {
  externalParsers?: ExternalParsers;
  verboseParsing?: { [variableName: string]: any };
  postParsers?: PostParser<AstNode[], AstNode[]>[];
};
const runPostParsers = (ast: AstNode[], postParsers: ParseIcuOptions['postParsers'] = []) =>
  postParsers.reduce((ast, postParser) => postParser(ast), ast);

export const parseIcu = (message: string, options: ParseIcuOptions): AstNode[] => {
  if (!message.includes('{')) return runPostParsers([message], options.postParsers);

  const topLevel: AstNode[] = [];
  const parentAstChain: AstNode[][] = [];
  let scopeVariableName: string | null = null;
  let ast: AstNode[] = topLevel;
  let prevAstPart: AstNode | null = null;
  let currentAstPart: AstNode | null = null;
  let escaping = false;
  let depth = 0;
  let bracketsGroupChunkId = 0;
  const nextPart = (triggerChar: string) => {
    let currentPart = currentAstPart!;
    let partConsumed = false;
    if (typeof currentPart === 'object' && currentPart !== null && typeof prevAstPart === 'object' && prevAstPart !== null) {
      if (
        currentPart.type === 'variable' &&
        prevAstPart.type === 'variable' &&
        currentPart.bracketsGroup == prevAstPart.bracketsGroup
      ) {
        if (currentPart.name === 'plural' || currentPart.name === 'selectordinal' || currentPart.name === 'select') {
          scopeVariableName = prevAstPart.name;
          currentPart = {
            type: currentPart.name === 'select' ? 'select' : 'plural',
            cardinal: currentPart.name !== 'selectordinal',
            variable: prevAstPart,
            options: {},
          } as PluralNode | SelectNode;
          ast.pop();
        } else if (externals.includes(currentPart.name)) {
          currentPart = {
            type: 'external',
            name: currentPart.name,
            variableName: prevAstPart.name,
            data: null,
            optionsPart: triggerChar !== '}',
            rawData: '',
          };
          ast.pop();
        } else {
          throw new Error(`Unsupported syntax rule "${currentPart.name}"`);
        }
      }
      if (currentPart.type === 'plural-offset' && prevAstPart.type === 'plural') {
        partConsumed = true;
        currentPart.value = Number.parseInt(currentPart.rawValue, 10);
        prevAstPart.offset = currentPart;
      }
      if (currentPart.type === 'plural-exact-value' && prevAstPart.type === 'plural') {
        partConsumed = true;
        prevAstPart.options.exacts = prevAstPart.options.exacts ?? {};
        prevAstPart.options.exacts[currentPart.value] = [];
        parentAstChain.push(ast);
        ast = prevAstPart.options.exacts[currentPart.value];
      }
      if (
        currentPart.type === 'variable' &&
        ((prevAstPart.type === 'plural' && pluralOptions.includes(currentPart.name)) || prevAstPart.type === 'select')
      ) {
        partConsumed = true;
        prevAstPart.options[currentPart.name as keyof typeof prevAstPart.options] = [];
        parentAstChain.push(ast);
        ast = prevAstPart.options[currentPart.name as keyof typeof prevAstPart.options] as AstNode[];
      }
    }
    if (!partConsumed && currentPart !== null) {
      ast.push(currentPart);
      prevAstPart = currentPart;
    }
    currentAstPart = null;
  };

  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    const currentEscaping = escaping;
    if (char === "'") {
      escaping = !escaping;
      if (message[i - 1] !== "'") {
        continue;
      }
    }
    const prevDepth = depth;

    if (char === '}' && !currentEscaping) {
      if (depth <= 0) {
        throw new Error(`Broken order of "{" and "}" in "${message}" of symbol ${i}`);
      }
      depth--;
    }

    if (char === '{' && !currentEscaping) {
      depth++;
      bracketsGroupChunkId++;
    }

    if (typeof prevAstPart === 'object' && prevAstPart?.type === 'external' && prevAstPart.optionsPart) {
      if (prevDepth === depth) {
        prevAstPart.rawData += char;
      } else {
        const verboseParsing =
          prevAstPart.rawData.trim() === 'verbose' ? (options.verboseParsing ?? {})[prevAstPart.variableName] : undefined;
        const parserAvailable = options.externalParsers?.[prevAstPart.name] || verboseParsing;
        if (!parserAvailable) {
          throw new Error(`Parser for "${prevAstPart.name}" (variable "${prevAstPart.variableName}") was not provided`);
        }
        prevAstPart.data = options.externalParsers?.[prevAstPart.name](
          prevAstPart.rawData,
          prevAstPart.variableName,
          verboseParsing,
        );
        prevAstPart = null;
      }
      continue;
    }

    if (char === '#' && !currentEscaping && scopeVariableName) {
      const parentAst = parentAstChain[parentAstChain.length - 1];
      const parentNode = parentAst?.[parentAst?.length - 1];
      if (typeof parentNode === 'object' && parentNode.type === 'plural') {
        nextPart(char);

        currentAstPart = {
          type: 'external',
          name: 'number',
          optionsPart: false,
          variableName: parentNode.variable.name,
          data: { offset: parentNode.offset?.value },
          rawData: '',
        };

        nextPart(char);
        continue;
      }
    }
    const valueDepth = depth % 2 === 0;
    if (prevDepth !== depth && currentAstPart !== null) {
      nextPart(char);
    }
    if (!valueDepth && prevDepth > depth && parentAstChain.length > 0) {
      ast = parentAstChain.pop()!;
      prevAstPart = ast[ast.length - 1];
    }
    if (prevDepth !== depth) continue;

    if (currentAstPart === null) {
      if (valueDepth) currentAstPart = '';
      else if (char === ' ' && !currentEscaping) continue;
      else if (char === '\n' && !currentEscaping) continue;
      else if (char === '\r' && !currentEscaping) continue;
      else if (char === '\t' && !currentEscaping) continue;
      else if (char === '=' && !currentEscaping) {
        currentAstPart = { type: 'plural-exact-value', value: '' } as AstNode;
        continue;
      } else {
        currentAstPart = {
          type: 'variable',
          name: '',
          bracketsGroup: bracketsGroupChunkId,
        } as AstNode;
      }
    }
    if (typeof currentAstPart === 'object' && currentAstPart !== null && (char === ',' || char === ' ') && !currentEscaping) {
      nextPart(char);
    }
    if (currentAstPart === null) {
      if (valueDepth) currentAstPart = '';
    }

    if (typeof currentAstPart === 'string') currentAstPart += char;
    if (typeof currentAstPart === 'object' && currentAstPart !== null) {
      if (currentAstPart.type === 'plural-exact-value') currentAstPart.value += char;
      if (currentAstPart.type === 'plural-offset') currentAstPart.rawValue += char;
      if (currentAstPart.type === 'variable') {
        if (char === ':' && currentAstPart.name === 'offset') {
          currentAstPart = { type: 'plural-offset', rawValue: '', value: 0 };
        } else {
          currentAstPart.name += char;
        }
      }
    }
  }
  if (depth > 0) {
    throw new Error(`Broken order of "{" and "}" in "${message}" (need ${depth} more "}")`);
  }
  if (depth < 0) {
    throw new Error(`Broken order of "{" and "}" in "${message}" (${depth * -1} "}" is/are extra)`);
  }
  while (parentAstChain.length > 0) {
    ast = parentAstChain.pop()!;
  }
  if (currentAstPart !== null) ast.push(currentAstPart);

  return runPostParsers(ast, options.postParsers);
};

export type PostParser<InputAst extends AstNode[], OutputAst extends AstNode[]> = (inputAst: InputAst) => OutputAst;
