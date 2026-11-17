// 判定普通对象（对象字面量或 Object.create(null)）。
// 只此一处用途，自实现即可，避免为它引入 lodash-unified 及其 lodash / lodash-es 两个 peer 依赖。
const isPlainObject = value => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

// 已加载的字体路径列表
let fontPathList = [];
let nodeFs = null;
// 是否是浏览器
export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
// 是否是node环境
export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const getNodeFs = () => {
  if (!isNode) {
    throw new Error('fs is not available in browser builds');
  }
  if (!nodeFs) {
    nodeFs = process.getBuiltinModule?.('node:fs') ?? process.getBuiltinModule?.('fs');
  }
  if (!nodeFs) {
    throw new Error('fs is not available in the current Node.js runtime');
  }
  return nodeFs;
};

// 字体注册表：fontPath -> { manifest, fonts, loadings }
// - manifest：字体清单（每个路径只请求一次）
// - fonts：已注册到 document.fonts 的 FontFace（注册不等于下载）
// - loadings：进行中的字体族加载 Promise，避免重复请求
const fontRegistry = new Map();
// 已加载完成的字体族：fontPath -> Set<family>
const loadedFontFamilyMap = new Map();

// 字体代数：每加载完成一个新字体族递增一次，供文本组件判断字形度量是否已失效
let fontEpoch = 0;
export const getFontEpoch = () => fontEpoch;

const getFontRegistry = fontPath => {
  if (!fontRegistry.has(fontPath)) {
    fontRegistry.set(fontPath, { manifest: null, fonts: new Map(), loadings: new Map() });
    loadedFontFamilyMap.set(fontPath, new Set());
  }
  return fontRegistry.get(fontPath);
};

// 读取字体清单（失败时清空缓存，允许调用方重试）
const readFontManifest = fontPath => {
  const registry = getFontRegistry(fontPath);
  if (!registry.manifest) {
    registry.manifest = fetch(`${fontPath}/font-list.json`).then(res => {
      if (!res.ok) {
        throw new Error(`字体清单请求失败: ${fontPath}/font-list.json`);
      }
      return res.json();
    }).catch(err => {
      registry.manifest = null;
      throw err;
    });
  }
  return registry.manifest;
};

// 注册字体族（仅注册，不触发下载）
// 只声明 woff2：仓库中的 .ttf 是冗余源文件，浏览器也只会选 woff2
const registerFontFace = (fontPath, family) => {
  const registry = getFontRegistry(fontPath);
  if (!registry.fonts.has(family)) {
    const font = new FontFace(family, `url(${fontPath}/${family}.woff2) format('woff2')`, {
      display: 'swap',
    });
    document.fonts.add(font);
    registry.fonts.set(family, font);
  }
  return registry.fonts.get(family);
};

// 按需下载指定字体族；单个字体失败不影响其它字体（降级为系统字体）
const loadFontFamilies = (fontPath, families) => {
  const registry = getFontRegistry(fontPath);
  const loaded = loadedFontFamilyMap.get(fontPath);
  return Promise.allSettled(families.map(family => {
    if (loaded.has(family)) {
      return Promise.resolve();
    }
    if (registry.loadings.has(family)) {
      return registry.loadings.get(family);
    }
    const loading = registerFontFace(fontPath, family).load().then(() => {
      loaded.add(family);
      fontEpoch++;
    }).catch(() => {
      // 标记为已处理，避免每次绘制都重复请求同一个失败的字体
      loaded.add(family);
    }).finally(() => {
      registry.loadings.delete(family);
    });
    registry.loadings.set(family, loading);
    return loading;
  }));
};

// 加载字体 - 浏览器环境，异步
// families：本次需要加载的字体族；省略时加载清单内全部字体（保持旧行为）
export const loadFontBrowser = (fontPath, families) => {
  if (!fontPathList.includes(fontPath)) {
    fontPathList.push(fontPath);
  }
  return readFontManifest(fontPath).then(async manifest => {
    let wanted;
    if (Array.isArray(families)) {
      // 只加载清单中存在的字体族；自定义字体由 customFont.js 单独注册
      wanted = [...new Set(families)].filter(family => manifest.includes(family));
    } else {
      wanted = manifest;
    }
    await loadFontFamilies(fontPath, wanted);
  });
};

// 加载字体 - Nodejs 环境，同步
export const loadFontNode = (fontPath, skia) => {
  if (fontPathList.includes(fontPath)) {
    return;
  }
  fontPathList.push(fontPath);
  let data;
  try {
    data = JSON.parse(getNodeFs().readFileSync(`${fontPath}/font-list.json`, 'utf-8'));
  } catch (e) {
    // 字体清单读取失败（路径错误/文件缺失）时不中断卡片渲染，降级为系统字体
    console.error(`[loadFontNode] 读取字体清单失败: ${fontPath}`, e);
    return;
  }
  if (skia) {
    data.forEach(family => {
      try {
        skia.FontLibrary.use(family, [
          `${fontPath}/${family}.woff2`,
        ]);
      } catch (e) {
        console.error(`[loadFontNode] 注册字体失败: ${family}`, e);
      }
    });
  }
};

// 数字转全角（兼容 number / string 入参，空值原样返回，避免 atk/def/箭头数量等数值型数据抛错）
export const numberToFull = value => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value).replace(/\d/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
};

// 继承css样式
export const inheritProp = (obj, parentObj = {}) => {
  const inheritPropList = ['fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing'];
  inheritPropList.forEach(inherit => {
    if (!Object.hasOwn(obj, inherit) && Object.hasOwn(parentObj, inherit)) {
      obj[inherit] = parentObj[inherit];
    }
  });
  Object.keys(obj).forEach(key => {
    if (isPlainObject(obj[key])) {
      inheritProp(obj[key], obj);
    }
  });
  return obj;
};

// 收集样式树中引用到的全部字体族（fontFamily / rtFontFamily）
// 用于按需加载：样式里用不到的字体族不再下载
export const collectFontFamilies = style => {
  const families = new Set();
  const walk = obj => {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'fontFamily' || key === 'rtFontFamily') {
        if (typeof value === 'string' && value) {
          families.add(value);
        }
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    });
  };
  walk(style);
  return [...families];
};

// 字体样式里与「模板坐标」无关的属性：合并时只取这些
const FONT_STYLE_KEYS = [
  'fontFamily',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'rtFontSize',
  'rtTop',
  'rtFontScaleX',
  'scaleX',
  'scaleY',
];

// 参与合并的样式节点
const FONT_STYLE_NODES = ['name', 'spellTrap', 'effect', 'description'];

// 从「模板基准样式」出发，叠加「字体样式」中的字体属性。
//
// 经典卡（yugioh-card）的字体样式把坐标与字体混写在一起：其中的 top / right / icon /
// textIndent / minHeight / fontSize 都是为经典卡模板调的，直接套到别的模板上会让元素跑位、
// 字号偏小。这里只取字体属性，坐标与字号仍沿用基准样式（第二个模板坐标的真实来源）。
//
// @param {object} baseStyle 模板基准样式（提供坐标与字号）
// @param {object} fontStyle 字体样式（提供字体属性）
// @returns {object} 合并后的样式
export const mergeFontStyle = (baseStyle, fontStyle) => {
  const style = {};

  FONT_STYLE_KEYS.forEach(prop => {
    if (fontStyle[prop] !== undefined) {
      style[prop] = fontStyle[prop];
    } else if (baseStyle[prop] !== undefined) {
      style[prop] = baseStyle[prop];
    }
  });

  FONT_STYLE_NODES.forEach(node => {
    const base = baseStyle[node];
    if (!base) {
      return;
    }
    const patch = fontStyle[node] || {};
    style[node] = { ...base };
    FONT_STYLE_KEYS.forEach(prop => {
      // 节点自身声明优先，否则继承字体样式的顶层值（等价于 inheritProp 的下传）
      if (patch[prop] !== undefined) {
        style[node][prop] = patch[prop];
      } else if (fontStyle[prop] !== undefined) {
        style[node][prop] = fontStyle[prop];
      }
    });
  });

  return style;
};
