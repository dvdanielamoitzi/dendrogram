import { ITree } from "./interfaces";

export function parseNewick(newick: string): ITree {
  const s = newick;
  const ancestors = [];
  let tree: ITree = {};
  const tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let subTree = {};

    switch (token) {
      case "(": // new children
        subTree = {};
        tree.children = [subTree];
        ancestors.push(tree);
        tree = subTree;
        break;
      case ",": // another branch
        subTree = {};
        ancestors[ancestors.length - 1].children.push(subTree);
        tree = subTree;
        break;
      case ")": // optional name next
        tree = ancestors.pop();
        break;
      case ":": // optional value next
        break;
      default: {
        const x = tokens[i - 1];
        if (x === ")" || x === "(" || x === ",") {
          tree.name = token;
        } else if (x === ":") {
          tree.value = parseFloat(token);
        }
      }
    }
  }
  return tree;
}
