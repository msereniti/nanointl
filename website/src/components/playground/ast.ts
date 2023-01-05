import { AstNode } from 'nanointl/parse';

export const getAstInterpolations = (ast: AstNode[]): Exclude<AstNode, string>[] => {
  const result: { [variableName: string]: Exclude<AstNode, string> } = {};

  const traverse = (ast: AstNode[]) => {
    for (const node of ast) {
      if (typeof node === 'string') continue;
      if (node.type === 'variable' && !result[node.name]) result[node.name] = node;
      if (node.type === 'external') {
        if (node.data && 'children' in node.data) {
          traverse(node.data.children);
        }
        result[node.variableName] = node;
      }
      if (node.type === 'select') {
        result[node.variable.name] = node;
        for (const option in node.options) {
          traverse(node.options[option]);
        }
      }
      if (node.type === 'plural') {
        result[node.variable.name] = node;
        for (const exact in node.options.exacts ?? {}) {
          traverse(node.options.exacts![exact]);
        }
        for (const option of ['zero', 'one', 'two', 'few', 'many', 'other'] as const) {
          if (node.options[option]) {
            traverse(node.options[option]!);
          }
        }
      }
    }
  };
  traverse(ast);

  return Object.values(result);
};

export const interpolationDefaultValues = (ast: AstNode[]) =>
  ast.reduce((acc, node) => {
    if (typeof node === 'string') return acc;
    if (node.type === 'variable') acc[node.name] = '';
    if (node.type === 'plural') acc[node.variable.name] = 1;
    if (node.type === 'external' && node.name === 'number') acc[node.variableName] = 1;
    if (node.type === 'external' && node.name === 'date') acc[node.variableName] = new Date();
    if (node.type === 'external' && node.name === 'time') acc[node.variableName] = new Date();
    if (node.type === 'select') acc[node.variable.name] = Object.keys(node.options)[0];

    return acc;
  }, {} as { [value: string]: any });
