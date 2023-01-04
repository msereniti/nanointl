import { AstNode } from 'nanointl/parse';

export const astToFormattedHtml = (ast: AstNode[]): string =>
  ast
    .map((part) => {
      if (typeof part === 'string') {
        return part.replaceAll('<', '&lt').replaceAll('>', '&gt');
      }
      if (part.type === 'variable') {
        return `<span class="bg-red-400/75">{${part.name}}</span>`;
      }
      if (part.type === 'external') {
        if (part.name === 'md-token') {
          if (part.variableName === 'strong') {
            return `<span class="bg-amber-400/75">**${astToFormattedHtml(part.data.children)}**</span>`;
          }
          if (part.variableName === 'emphasis') {
            return `<span class="bg-amber-400/75">_${astToFormattedHtml(part.data.children)}_</span>`;
          }
          if (part.variableName === 'link') {
            return `<span class="bg-amber-400/75">[${astToFormattedHtml(part.data.children)}](${part.data.url}}</span>`;
          }
        } else if (part.name === 'tag') {
          const tag = part.variableName;
          return `<span class="bg-amber-400/75">&lt${tag}&gt${astToFormattedHtml(part.data.children)}&lt/${tag}&gt</span>`;
        }

        if (part.rawData === '#') return `<span class="bg-amber-400/75">#</span>`;
        let inner = `${part.variableName}, ${part.name}`;
        if (part.rawData) inner += `, ${part.rawData}`;
        return `<span class="bg-amber-400/75">{${inner}}</span>`;
      }
      if (part.type === 'select') {
        const options = Object.entries(part.options)
          .map(([optionName, option]) => `<span class="bg-blue-400/75">${optionName} {${astToFormattedHtml(option)}}</span>`)
          .join('');

        return `<span class="bg-green-400/75">{${part.variable.name}, select, ${options}}</span>`;
      }
      if (part.type === 'plural') {
        const type = part.cardinal ? 'plural' : 'selectordinal';
        let inner = '';
        if (part.variable.offset) inner += `offset:${part.variable.offset.rawValue} `;
        for (const exact in part.options.exacts ?? {}) {
          inner += `=${exact} {${astToFormattedHtml(part.options.exacts![exact])}} `;
        }
        for (const option of ['zero', 'one', 'two', 'few', 'many', 'other'] as const) {
          if (part.options[option]) {
            inner += ` ${option} {${astToFormattedHtml(part.options[option]!)}}`;
          }
        }

        return `<span class="bg-teal-400/75">{${part.variable.name}, ${type}, ${inner}}</span>`;
      }
      if (part.type === 'pure-text') {
        return part.text.replaceAll("'", "''").replaceAll('<', '&lt').replaceAll('>', '&gt');
      }
    })
    .join('');

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
    if (node.type === 'variable') acc[node.name] = 'xxx';
    if (node.type === 'plural') acc[node.variable.name] = 1;
    if (node.type === 'external' && node.name === 'number') acc[node.variableName] = 1;
    if (node.type === 'external' && node.name === 'date') acc[node.variableName] = new Date();
    if (node.type === 'external' && node.name === 'time') acc[node.variableName] = new Date();
    if (node.type === 'select') acc[node.variable.name] = Object.keys(node.options)[0];

    return acc;
  }, {} as { [value: string]: any });
