import { deriveStyle } from '../../utils/style.js';
import scStyle from './sc-style.js';

// 华康隶书体 W7：排版参数与 sc-style 一致，但不启用小字回退（该字体不需要）
export default deriveStyle(scStyle, {
  fontFamily: 'ygo-hklsw7',
  dropDescription: ['smallFontSize'],
});
