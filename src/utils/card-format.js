// 外部卡片数据的字段归一化。
//
// 其它制卡器导出的 JSON 字段名各不相同，这里只做「同义字段认领」，
// 不猜测枚举值（属性、种族、卡类），避免把 LIGHT 之类的外来值直接塞进渲染层。
const FIELD_ALIASES = {
  name: ['name', 'cardName', 'cardname', 'title'],
  description: ['description', 'desc', 'text', 'effect'],
  atk: ['atk', 'ATK'],
  def: ['def', 'DEF'],
  level: ['level', 'stars'],
  password: ['password', 'passcode', 'id', 'code'],
  image: ['image', 'imageUrl', 'image_url', 'art'],
};

const NUMERIC_FIELDS = new Set(['atk', 'def', 'level']);

/**
 * 判断导入的数据是否来自其它工具。
 *
 * 本项目导出的数据一定带有 cardType 与 description 两个字段，
 * 缺 cardType 且出现过 desc/cardName 之类字段时按外部格式处理。
 *
 * @param {unknown} data 解析后的 JSON 对象。
 * @returns {boolean} 是否需要做字段归一化。
 */
export const isForeignCard = data => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  if ('cardType' in data) {
    return false;
  }
  return ['desc', 'cardName', 'cardname', 'text'].some(key => key in data);
};

/**
 * 把外部卡片数据归一成本项目的字段名。
 *
 * 只认领名称、描述、攻击、守备、等级、密码与图片，返回的对象可直接与
 * 当前卡型的默认值合并；无法识别的字段一律丢弃。
 *
 * @param {Record<string, unknown>} source 外部卡片数据。
 * @returns {Record<string, unknown>} 归一化后的字段集合。
 */
export const normalizeForeignCard = source => {
  const result = {};
  if (!source || typeof source !== 'object') {
    return result;
  }
  for (const [target, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const key of aliases) {
      const value = source[key];
      if (value === undefined || value === null || value === '') {
        continue;
      }
      result[target] = value;
      break;
    }
  }
  NUMERIC_FIELDS.forEach(key => {
    if (!(key in result)) {
      return;
    }
    const value = Number(result[key]);
    if (Number.isFinite(value)) {
      result[key] = value;
    } else {
      delete result[key];
    }
  });
  if ('password' in result) {
    result.password = String(result.password).trim();
  }
  return result;
};
