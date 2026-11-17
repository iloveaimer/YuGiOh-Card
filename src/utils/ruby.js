// 日文卡面注音生成。
//
// 渲染层使用 [汉字(かな)] 语法，本模块负责把普通日文转换为该语法。
// 读音来源分两层：常用卡牌词表（高质量）与逐字读音表（兜底）。
// 逐字推测只用于多字复合词，单字后接假名时取训读，避免把「相手」读成「そうしゅ」。
import KANJI_READINGS from '../data/kanji-readings.js';

// 卡牌文本高频词：逐字读音会读错的组合，逐条给出正确读法
const WORD_READINGS = {
  相手: 'あいて',
  自分: 'じぶん',
  味方: 'みかた',
  手札: 'てふだ',
  山札: 'やまふだ',
  墓地: 'ぼち',
  表側: 'おもてがわ',
  裏側: 'うらがわ',
  罠: 'わな',
  発動: 'はつどう',
  効果: 'こうか',
  魔法: 'まほう',
  儀式: 'ぎしき',
  融合: 'ゆうごう',
  召喚: 'しょうかん',
  特殊: 'とくしゅ',
  通常: 'つうじょう',
  反転: 'はんてん',
  攻撃: 'こうげき',
  守備: 'しゅび',
  表示: 'ひょうじ',
  戦闘: 'せんとう',
  無効: 'むこう',
  破壊: 'はかい',
  除外: 'じょがい',
  対象: 'たいしょう',
  選択: 'せんたく',
  場合: 'ばあい',
  以上: 'いじょう',
  以下: 'いか',
  種類: 'しゅるい',
  属性: 'ぞくせい',
  種族: 'しゅぞく',
  星: 'ほし',
  処理: 'しょり',
  確認: 'かくにん',
  永続: 'えいぞく',
  速攻: 'そっこう',
  装備: 'そうび',
  攻撃力: 'こうげきりょく',
  守備力: 'しゅびりょく',
  枚数: 'まいすう',
  体: 'たい',
  枚: 'まい',
  回: 'かい',
  度: 'ど',
};

const WORD_MAX_LENGTH = Math.max(...Object.keys(WORD_READINGS).map(word => word.length));
const KANJI_PATTERN = /[\u4E00-\u9FFF\u3005]/;
const KANA_PATTERN = /[\u3041-\u309F]/;
// 送假名常见首字：接在这些假名前的单字按训读处理，否则按音读（如「１体を」读 たい）
const OKURIGANA_HEADS = new Set('るうくすつぬむぶぐふえけせてでねべめ');
const EXISTING_RUBY_PATTERN = /\[[^[\]]+\([^()]*\)]/;

const isKanji = char => KANJI_PATTERN.test(char);
const isKana = char => KANA_PATTERN.test(char);

const parseEntry = char => {
  const raw = KANJI_READINGS[char];
  if (!raw) {
    return null;
  }
  const [onPart, kunPart] = raw.split('|');
  return {
    on: onPart ? onPart.split(',').filter(Boolean) : [],
    kun: kunPart ? kunPart.split(',').filter(Boolean) : [],
  };
};

/**
 * 判断文本里是否已经含有注音语法。
 *
 * @param {string} text 待检查文本。
 * @returns {boolean} 是否已包含 [汉字(假名)] 片段。
 */
export const hasRuby = text => EXISTING_RUBY_PATTERN.test(text || '');

/**
 * 为一个连续汉字串推导读音。
 *
 * @param {string} run 连续汉字，长度至少为 1。
 * @param {boolean} followedByKana 该串后面是否紧接假名。
 * @returns {string} 假名读音，无法确定时返回空串。
 */
const readKanjiRun = (run, followedByKana) => {
  if (run.length === 1) {
    const entry = parseEntry(run);
    if (!entry) {
      return '';
    }
    if (followedByKana && entry.kun.length) {
      return entry.kun[0];
    }
    return entry.on[0] || entry.kun[0] || '';
  }
  // 多字复合词按音读拼接；任一字符缺读音则整段放弃，避免半截注音
  const parts = [];
  for (const char of run) {
    const entry = parseEntry(char);
    if (!entry || !entry.on.length) {
      return '';
    }
    parts.push(entry.on[0]);
  }
  return parts.join('');
};

/**
 * 把日文文本转换为带注音的语法。
 *
 * 已包含注音的文本原样返回，避免重复包裹。
 *
 * @param {string} text 原始文本。
 * @returns {string} 转换后的文本。
 */
export const toRubyText = (text = '') => {
  const source = String(text);
  if (!source || !KANJI_PATTERN.test(source) || hasRuby(source)) {
    return source;
  }
  let result = '';
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (!isKanji(char)) {
      result += char;
      index += 1;
      continue;
    }
    let matchedWord = '';
    for (let length = Math.min(WORD_MAX_LENGTH, source.length - index); length >= 1; length -= 1) {
      const candidate = source.slice(index, index + length);
      if (WORD_READINGS[candidate]) {
        matchedWord = candidate;
        break;
      }
    }
    if (matchedWord) {
      result += `[${matchedWord}(${WORD_READINGS[matchedWord]})]`;
      index += matchedWord.length;
      continue;
    }
    let end = index;
    while (end < source.length && isKanji(source[end])) {
      end += 1;
    }
    const run = source.slice(index, end);
    const nextChar = source[end] || '';
    const reading = readKanjiRun(run, isKana(nextChar) && OKURIGANA_HEADS.has(nextChar));
    result += reading ? `[${run}(${reading})]` : run;
    index = end;
  }
  return result;
};
