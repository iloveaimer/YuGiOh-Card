import { isPlainObject } from 'lodash-unified';
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

// 已保存的字体加载 Promise（同一路径复用，避免重复加载）
const fontReadyPromiseMap = new Map();

// 加载字体 - 浏览器环境，异步
export const loadFontBrowser = fontPath => {
  // 已加载过则直接返回缓存 Promise，保证调用方都能等待同一份加载完成
  if (fontReadyPromiseMap.has(fontPath)) {
    return fontReadyPromiseMap.get(fontPath);
  }
  const promise = new Promise((resolve, reject) => {
    fontPathList.push(fontPath);
    fetch(`${fontPath}/font-list.json`).then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error();
      }
    }).then(async data => {
      const fontList = [];
      data.forEach(family => {
        const font = new FontFace(
          family,
          `url(${fontPath}/${family}.woff2) format('woff2'), url(${fontPath}/${family}.ttf) format('truetype')`,
          {
            display: 'swap',
          },
        );
        document.fonts.add(font);
        fontList.push(font);
      });
      const fontLoadList = fontList.map(font => font.load());
      await Promise.allSettled(fontLoadList);
      resolve();
    }).catch(() => {
      // 加载失败时清除缓存，允许下次重试
      fontReadyPromiseMap.delete(fontPath);
      reject('读取字体失败');
    });
  });
  fontReadyPromiseMap.set(fontPath, promise);
  return promise;
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

// 数字转全角
export const numberToFull = value => {
  return value.replace(/\d/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
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
