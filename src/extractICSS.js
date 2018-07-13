const importPattern = /^:import\(("[^"]*"|'[^']*'|[^"']+)\)$/;

const getDeclsObject = rule => {
  const object = {};
  rule.walkDecls(decl => {
    object[decl.raws.before.trim() + decl.prop] = decl.value;
  });
  return object;
};

const extractICSS = (css, removeRules = true) => {
  const icssImports = {};
  const icssExports = {};
  // 传入一个css ast节点
  css.each(node => {
    if (node.type === "rule") {
      if (node.selector.slice(0, 7) === ":import") {
        // 获取:import(xx) 中的 xx
        const matches = importPattern.exec(node.selector);
        if (matches) {
          const path = matches[1].replace(/'|"/g, "");
          // doc http://api.postcss.org/Root.html#walkDecls
          // 然后获取 :import(xx) { a: b } 中的a和b，使用rule.walkDecls loop
          const aliases = Object.assign(
            icssImports[path] || {},
            getDeclsObject(node)
          );
          icssImports[path] = aliases;
          // 默认删除这个node
          if (removeRules) {
            node.remove();
          }
        }
      }
      if (node.selector === ":export") {
        // 导出直接使用walkDecls 把里面的内容遍历出来
        Object.assign(icssExports, getDeclsObject(node));
        if (removeRules) {
          node.remove();
        }
      }
    }
  });
  return { icssImports, icssExports };
};

export default extractICSS;
