// 样式派生：把只差字体族或个别字段的同构样式收敛为「基准 + 覆盖」。
//
// 基准样式是模块级单例，多份样式共享同一批嵌套对象会被任何一侧的修改污染，
// 因此这里先深拷贝再叠加覆盖项。样式解析阶段会把顶层 fontFamily 下放到每个
// 子块（名称、类型栏、效果、描述等），派生时同样逐个改写，才能与手写文件等价。
// dropDescription 用于移除变体不需要的字段（例如某些字体不启用小字模式）。
const applyFontFamily = (node, fontFamily) => {
  if (!node || typeof node !== 'object') {
    return;
  }
  Object.entries(node).forEach(([key, value]) => {
    if (key === 'fontFamily') {
      node[key] = fontFamily;
      return;
    }
    applyFontFamily(value, fontFamily);
  });
};

export const deriveStyle = (base, options = {}) => {
  const { fontFamily, description, dropDescription = [] } = options;
  const style = JSON.parse(JSON.stringify(base));
  if (fontFamily) {
    style.fontFamily = fontFamily;
    applyFontFamily(style, fontFamily);
  }
  if (description) {
    style.description = { ...(style.description || {}), ...description };
  }
  if (style.description) {
    dropDescription.forEach(key => {
      delete style.description[key];
    });
  }
  return style;
};
