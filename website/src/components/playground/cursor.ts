const getParentsChain = (node: Node, rootParent: Element): number[] => {
  if (node === rootParent || !node.parentNode) return [];
  return [...getParentsChain(node.parentNode, rootParent), [...(node.parentNode!.childNodes as any)].indexOf(node)];
};
const getNodeByChain = (node: Node, chain: number[]): Node =>
  chain.length ? getNodeByChain(node.childNodes[chain[0]], chain.slice(1)) : node;

export const getCursorPosition = (container: Element) => {
  try {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (!selection?.rangeCount || !range) return null;

    return {
      startOffset: range.startOffset,
      startChain: range.startContainer ? getParentsChain(range.startContainer, container) : [],
      endOffset: range.endOffset,
      endChain: range.endContainer ? getParentsChain(range.endContainer, container) : [],
    };
  } catch {
    return null;
  }
};
const getNodeByCursorPosition = (rootNode: Node, offset: number): { node: Node; offset: number } => {
  if (rootNode.nodeType === rootNode.TEXT_NODE) rootNode = rootNode.parentNode!;
  for (const node of rootNode.childNodes) {
    if (node.nodeType === node.TEXT_NODE) {
      const textContent = node.textContent ?? '';
      if (offset <= textContent.length) return { node, offset };
      else offset -= textContent.length;
    } else {
      const textContent = node.textContent ?? '';
      if (offset <= textContent.length) return getNodeByCursorPosition(node, offset);
      else offset -= textContent.length;
    }
  }
  return { node: rootNode, offset };
};

export const restoreCursorPosition = (
  container: Element,
  cursorPosition: Exclude<ReturnType<typeof getCursorPosition>, null>,
) => {
  const range = document.createRange();
  const selection = window.getSelection();
  if (!selection) return;
  if (!container) return;
  if (!cursorPosition) return;

  try {
    const rangeStartContainer = getNodeByChain(container, cursorPosition.startChain);
    const rangeEndContainer = getNodeByChain(container, cursorPosition.endChain);
    try {
      range.setStart(rangeStartContainer, cursorPosition.startOffset);
      range.setEnd(rangeEndContainer, cursorPosition.endOffset);
    } catch {
      try {
        const start = getNodeByCursorPosition(rangeStartContainer, cursorPosition.startOffset);
        const end = getNodeByCursorPosition(rangeEndContainer, cursorPosition.endOffset);
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
      } catch {
        /* let it be */
      }
    }
  } catch {
    /* let it be */
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};
