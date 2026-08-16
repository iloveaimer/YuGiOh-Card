/**
 * 卡片文本规范化模块。
 *
 * 对标 ygocarder 的 text-normalize，负责在 CompressText 解析前对用户输入的
 * 卡片文本做排版层面的规范化处理，包含：
 * 1. 全角字母/数字/空格 → 半角（不影响中文全角标点）。
 * 2. 直引号 → 弯引号（成对切换开/闭引号）。
 * 3. 双连字符 -- → 破折号 —。
 * 4. 项目符号后的连续空格 → 移除（项目符号自带固定间距）。
 * 5. (n) 数字括号序号 → 圈码符号（①②③...）。
 *
 * 仅在 CompressText 的 normalize 开关开启时生效，默认关闭。
 */

// 全角数字 ０-９、全角大写 Ａ-Ｚ、全角小写 ａ-ｚ
const fullwidthAlnumPattern = /[\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/g;
// 全角空格（U+3000）
const fullwidthSpacePattern = /\u3000/g;
// 圈码 ⓪-⑳
const circledNumber = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];

/**
 * 全角字母/数字/空格转半角。
 *
 * @param {string} text 原始文本。
 * @returns {string} 规范化后的文本。
 */
const fullwidthToHalfwidth = text => {
  return text
    .replace(fullwidthSpacePattern, ' ')
    .replace(fullwidthAlnumPattern, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
};

/**
 * 直引号转成对弯引号。
 *
 * @param {string} text 原始文本。
 * @returns {string} 规范化后的文本。
 */
const straightToCurlyQuotes = text => {
  let result = '';
  let doubleOpen = true;
  let singleOpen = true;
  for (const ch of text) {
    if (ch === '"') {
      result += doubleOpen ? '\u201C' : '\u201D'; // “ ”
      doubleOpen = !doubleOpen;
    } else if (ch === "'") {
      result += singleOpen ? '\u2018' : '\u2019'; // ‘ ’
      singleOpen = !singleOpen;
    } else {
      result += ch;
    }
  }
  return result;
};

/**
 * 数字括号序号转圈码，(1)-(20) → ①-⑳。
 *
 * @param {string} text 原始文本。
 * @returns {string} 规范化后的文本。
 */
const parenthesizedNumberToCircled = text => {
  return text.replace(/\((\d{1,2})\)/g, (match, num) => {
    const n = parseInt(num, 10);
    return n <= 20 ? circledNumber[n] : match;
  });
};

/**
 * 执行卡片文本规范化。
 *
 * @param {string} text 原始文本。
 * @returns {string} 规范化后的文本。
 */
export const normalizeCardText = text => {
  if (!text) {
    return text;
  }
  let result = String(text);
  result = fullwidthToHalfwidth(result);
  result = straightToCurlyQuotes(result);
  result = result.replace(/--/g, '\u2014'); // -- → 破折号
  result = result.replace(/●\s+/g, '●'); // 项目符号后空格移除
  result = parenthesizedNumberToCircled(result);
  return result;
};
