import { createApp } from 'vue';
import {
  ElButton,
  ElButtonGroup,
  ElCheckbox,
  ElColorPicker,
  ElConfigProvider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTooltip,
  ElUpload,
} from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import 'normalize.css';
import '@/styles/main.scss';

// 只注册模板实际使用的组件，避免把整个 Element Plus 打进首屏包。
const components = [
  ElButton,
  ElButtonGroup,
  ElCheckbox,
  ElColorPicker,
  ElConfigProvider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTooltip,
  ElUpload,
];

const app = createApp(App);
components.forEach(component => app.use(component));
app.mount('#app');

// 只在生产构建注册 Service Worker：开发环境注册会与热更新抢缓存
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // sw.js 放在 public 下随构建产物一起发布，路径相对当前页面避免子目录部署失效
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI).pathname).catch(() => {
      // 注册失败不阻断应用启动，仅失去离线能力
    });
  });
}
