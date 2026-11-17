// OCG 卡片数据字典与解析工具。
//
// 负责把百鸽（ygocdb）与 ygoprodeck 的接口字段还原成渲染层需要的数据，
// 与界面逻辑无关，抽出独立模块便于单独维护与测试。

// 种族位掩码 → 各种族名（百鸽 race 字段）
export const RACE_MAP = {
  sc: { 1: '战士族', 2: '魔法师族', 4: '天使族', 8: '恶魔族', 16: '不死族', 32: '机械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鸟兽族', 1024: '植物族', 2048: '昆虫族', 4096: '雷族', 8192: '龙族', 16384: '兽族', 32768: '兽战士族', 65536: '恐龙族', 131072: '鱼族', 262144: '海龙族', 524288: '爬虫类族', 1048576: '念动力族', 2097152: '幻龙族', 4194304: '电子界族', 8388608: '幻神兽族', 16777216: '创造神族' },
  tc: { 1: '戰士族', 2: '魔法師族', 4: '天使族', 8: '惡魔族', 16: '不死族', 32: '機械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鳥獸族', 1024: '植物族', 2048: '昆蟲族', 4096: '雷族', 8192: '龍族', 16384: '獸族', 32768: '獸戰士族', 65536: '恐龍族', 131072: '魚族', 262144: '海龍族', 524288: '爬蟲類族', 1048576: '念動力族', 2097152: '幻龍族', 4194304: '電子界族', 8388608: '幻神獸族', 16777216: '創造神族' },
  jp: { 1: '戦士族', 2: '魔法使い族', 4: '天使族', 8: '悪魔族', 16: 'アンデット族', 32: '機械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鳥獣族', 1024: '植物族', 2048: '昆虫族', 4096: '雷族', 8192: 'ドラゴン族', 16384: '獣族', 32768: '獣戦士族', 65536: '恐竜族', 131072: '魚族', 262144: '海竜族', 524288: '爬虫類族', 1048576: 'サイキック族', 2097152: '幻竜族', 4194304: 'サイバース族', 8388608: '幻神獣族', 16777216: '創造神族' },
  en: { 1: 'Warrior', 2: 'Spellcaster', 4: 'Fairy', 8: 'Fiend', 16: 'Zombie', 32: 'Machine', 64: 'Aqua', 128: 'Pyro', 256: 'Rock', 512: 'Winged Beast', 1024: 'Plant', 2048: 'Insect', 4096: 'Thunder', 8192: 'Dragon', 16384: 'Beast', 32768: 'Beast-Warrior', 65536: 'Dinosaur', 131072: 'Fish', 262144: 'Sea Serpent', 524288: 'Reptile', 1048576: 'Psychic', 2097152: 'Wyrm', 4194304: 'Cyberse', 8388608: 'Divine-Beast', 16777216: 'Creator God' },
  kr: { 1: '전사족', 2: '마법사족', 4: '천사족', 8: '악마족', 16: '언데드족', 32: '기계족', 64: '물족', 128: '화염족', 256: '암석족', 512: '비행야수족', 1024: '식물족', 2048: '곤충족', 4096: '번개족', 8192: '드래곤족', 16384: '야수족', 32768: '야수전사족', 65536: '공룡족', 131072: '어류족', 262144: '해룡족', 524288: '파충류족', 1048576: '사이킥족', 2097152: '환룡족', 4194304: '사이버스족', 8388608: '환신야수족', 16777216: '창조신족' },
};

// 类型标签多语言映射（怪兽子类型/效果分类）
export const TYPE_LABELS = {
  sc: { tuner: '协调', spirit: '灵魂', union: '同盟', gemini: '二重', toon: '卡通', flip: '反转', link: '连接', xyz: '超量', synchro: '同调', fusion: '融合', ritual: '仪式', effect: '效果', normal: '通常', pendulum: '灵摆' },
  tc: { tuner: '協調', spirit: '靈魂', union: '同盟', gemini: '二重', toon: '卡通', flip: '反轉', link: '連接', xyz: '超量', synchro: '同步', fusion: '融合', ritual: '儀式', effect: '效果', normal: '通常', pendulum: '靈擺' },
  jp: { tuner: 'チューナー', spirit: 'スピリット', union: 'ユニオン', gemini: 'デュアル', toon: 'トゥーン', flip: 'リバース', link: 'リンク', xyz: 'エクシーズ', synchro: 'シンクロ', fusion: '融合', ritual: '儀式', effect: '効果', normal: '通常', pendulum: 'ペンデュラム' },
  en: { tuner: 'Tuner', spirit: 'Spirit', union: 'Union', gemini: 'Gemini', toon: 'Toon', flip: 'Flip', link: 'Link', xyz: 'Xyz', synchro: 'Synchro', fusion: 'Fusion', ritual: 'Ritual', effect: 'Effect', normal: 'Normal', pendulum: 'Pendulum' },
  kr: { tuner: '튜너', spirit: '스피릿', union: '유니온', gemini: '듀얼', toon: '툰', flip: '리버스', link: '링크', xyz: '엑시즈', synchro: '싱크로', fusion: '융합', ritual: '의식', effect: '효과', normal: '일반', pendulum: '펜듈럼' },
};

// 属性位掩码 → 属性 key
export const ATTR_KEY = { 1: 'earth', 2: 'water', 4: 'fire', 8: 'wind', 16: 'light', 32: 'dark', 64: 'divine' };

// ygoprodeck 英文数据源字段映射（用于英文描述的完整数据）
export const YGOPRODECK_ATTR = { LIGHT: 'light', DARK: 'dark', EARTH: 'earth', WATER: 'water', FIRE: 'fire', WIND: 'wind', DIVINE: 'divine' };

// ygoprodeck linkmarkers → 项目 arrowList 数字（1上 2右上 3右 4右下 5下 6左下 7左 8左上）
export const YGOPRODECK_MARKERS = { Top: 1, 'Top-Right': 2, Right: 3, 'Bottom-Right': 4, Bottom: 5, 'Bottom-Left': 6, Left: 7, 'Top-Left': 8 };

// ygoprodeck frameType → [主类型, 卡类]
export const YGOPRODECK_FRAME = {
  normal: ['monster', 'normal'],
  effect: ['monster', 'effect'],
  ritual: ['monster', 'ritual'],
  fusion: ['monster', 'fusion'],
  synchro: ['monster', 'synchro'],
  xyz: ['monster', 'xyz'],
  link: ['monster', 'link'],
  spell: ['spell', 'normal'],
  trap: ['trap', 'normal'],
  normal_pendulum: ['pendulum', 'normal-pendulum'],
  effect_pendulum: ['pendulum', 'effect-pendulum'],
  ritual_pendulum: ['pendulum', 'ritual-pendulum'],
  fusion_pendulum: ['pendulum', 'fusion-pendulum'],
  synchro_pendulum: ['pendulum', 'synchro-pendulum'],
  xyz_pendulum: ['pendulum', 'xyz-pendulum'],
};

// ygoprodeck 魔法/陷阱 race → 项目 icon
export const YGOPRODECK_ICON = { Field: 'field', Equip: 'equip', Continuous: 'continuous', 'Quick-Play': 'quick-play', Ritual: 'ritual', Counter: 'counter', Normal: '' };

export const getRaceName = (raceCode, lang) => {
  const map = RACE_MAP[lang] || RACE_MAP.sc;
  return map[raceCode] || '';
};

export const getTypeLabels = lang => TYPE_LABELS[lang] || TYPE_LABELS.sc;

// 百鸽 type 位掩码 → { 主类型, 标签列表, 卡类 }
export const parseOcgType = (code, lang = 'sc') => {
  const L = getTypeLabels(lang);
  if (code & 0x2) return { type: 'spell', labels: [] };
  if (code & 0x4) return { type: 'trap', labels: [] };
  const result = { type: 'monster', labels: [], cardType: '' };
  if (code & 0x1000000) result.type = 'pendulum';
  if (code & 0x1000) result.labels.push(L.tuner);
  if (code & 0x200) result.labels.push(L.spirit);
  if (code & 0x400) result.labels.push(L.union);
  if (code & 0x800) result.labels.push(L.gemini);
  if (code & 0x8000) result.labels.push(L.toon);
  if (code & 0x200000) result.labels.push(L.flip);
  if (code & 0x4000000) { result.labels.push(L.link); result.cardType = 'link'; }
  else if (code & 0x800000) { result.labels.push(L.xyz); result.cardType = 'xyz'; }
  else if (code & 0x2000) { result.labels.push(L.synchro); result.cardType = 'synchro'; }
  else if (code & 0x40) { result.labels.push(L.fusion); result.cardType = 'fusion'; }
  else if (code & 0x80) { result.labels.push(L.ritual); result.cardType = 'ritual'; }
  if (code & 0x20 || result.labels.length) { result.labels.push(L.effect); result.cardType = result.cardType || 'effect'; }
  else { result.labels.push(L.normal); result.cardType = 'normal'; }
  return result;
};

// 百鸽卡类 → 灵摆类型：普通灵摆的 subType 为 normal，渲染层素材名是 normal-pendulum。
export const toPendulumType = subType => `${subType || 'normal'}-pendulum`;