import { reactive, computed } from 'vue';
import zhCN from './zh-CN';
import enUS from './en-US';

const messages = { 'zh-CN': zhCN, 'en-US': enUS };

// 持久化界面语言选择（localStorage 在特殊环境可能不可用，做保护）
let saved = 'zh-CN';
try {
  saved = localStorage.getItem('ygo-ui-locale') || 'zh-CN';
} catch {
  saved = 'zh-CN';
}
const state = reactive({
  locale: messages[saved] ? saved : 'zh-CN',
});

/**
 * 翻译函数：根据当前界面语言返回文案
 * 在模板/JS 中调用，访问 state.locale 建立响应式依赖，语言切换时自动重渲染
 */
export function t(key) {
  return messages[state.locale]?.[key] ?? messages['zh-CN'][key] ?? key;
}

/** 切换界面语言 */
export function setLocale(locale) {
  if (!messages[locale]) return;
  state.locale = locale;
  try {
    localStorage.setItem('ygo-ui-locale', locale);
  } catch {
    // 忽略存储失败（如隐私模式），语言切换仍生效
  }
}

/** 当前界面语言（响应式） */
export function useUiLocale() {
  return computed(() => state.locale);
}
