// 自定义字体工具：支持用户导入字体文件，注册到浏览器并持久化到 IndexedDB。
//
// 设计要点：
// 1. 三个槽位（卡名 name / 正文 body / 数值 number）各自注册为固定的 FontFace 家族名，
//    不解析字体内部 name 表，避免本地化/编码问题。
// 2. 字体原始字节存入 IndexedDB，应用重启后恢复，实现跨会话持久化。
// 3. 运行时记录 FontFace 与 blob URL，便于删除时清理。

// 三槽位固定 FontFace 家族名（渲染层 package 里同样引用这些名字）
export const CUSTOM_FONT_FAMILY = {
  name: 'user-font-name',
  body: 'user-font-body',
  number: 'user-font-number',
};

export const CUSTOM_FONT_SLOTS = Object.keys(CUSTOM_FONT_FAMILY);

export const CUSTOM_FONT_ACCEPT = '.ttf,.otf,.woff,.woff2';

const DB_NAME = 'yugioh-card-custom-font';
const STORE_NAME = 'fonts';

// 运行时注册表：{ [slot]: { font: FontFace, blobUrl: string } }
const registry = {};

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 清理某个槽位已注册的 FontFace 与 blob URL
function cleanupSlot(slot) {
  const prev = registry[slot];
  if (prev) {
    if (prev.font && document.fonts) {
      document.fonts.delete(prev.font);
    }
    if (prev.blobUrl) {
      URL.revokeObjectURL(prev.blobUrl);
    }
    registry[slot] = null;
  }
}

// 根据文件扩展名推断字体 format hint 与 MIME type
const FONT_EXT_MAP = {
  woff2: { format: 'woff2', mime: 'font/woff2' },
  woff: { format: 'woff', mime: 'font/woff' },
  ttf: { format: 'truetype', mime: 'font/ttf' },
  otf: { format: 'opentype', mime: 'font/otf' },
};

function getFontMeta(fileName = '') {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  return FONT_EXT_MAP[ext] || {};
}

// 将字体字节注册为指定槽位的 FontFace
// 注意：必须先 document.fonts.add(font) 再 font.load()，并带 format hint + display: swap，
// 与项目自带 loadFontBrowser 保持一致，否则运行时动态添加的字体无法被 canvas 正确识别。
async function registerSlot(slot, buffer, fileName = '') {
  const family = CUSTOM_FONT_FAMILY[slot];
  cleanupSlot(slot);
  const { format, mime } = getFontMeta(fileName);
  // 指定 MIME type，帮助浏览器从 blob URL 正确嗅探字体格式
  const blob = mime ? new Blob([buffer], { type: mime }) : new Blob([buffer]);
  const blobUrl = URL.createObjectURL(blob);
  const source = `url(${blobUrl})${format ? ` format('${format}')` : ''}`;
  const font = new FontFace(family, source, { display: 'swap' });
  document.fonts.add(font);
  await font.load();
  registry[slot] = { font, blobUrl };
  return family;
}

// 读取文件字节（兼容不支持 file.arrayBuffer 的环境）
function readFileBuffer(file) {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// 导入用户字体文件：注册 + 持久化，返回 { family, fileName }
export async function importCustomFont(slot, file) {
  const buffer = await readFileBuffer(file);
  const family = await registerSlot(slot, buffer, file.name);
  await dbPut(slot, { fileName: file.name, buffer });
  return { family, fileName: file.name };
}

// 从 IndexedDB 恢复字体（应用启动时调用），无记录返回 null
export async function restoreCustomFont(slot) {
  try {
    const record = await dbGet(slot);
    if (!record || !record.buffer) return null;
    const family = await registerSlot(slot, record.buffer, record.fileName || '');
    return { family, fileName: record.fileName || '' };
  } catch (e) {
    console.error(`[customFont] 恢复槽位 ${slot} 失败:`, e);
    return null;
  }
}

// 移除自定义字体（清理运行时 + 删除持久化记录）
export async function removeCustomFont(slot) {
  cleanupSlot(slot);
  await dbDelete(slot);
}
