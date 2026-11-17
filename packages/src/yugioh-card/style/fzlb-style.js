import { deriveStyle } from '../../utils/style.js';
import scStyle from './sc-style.js';

// 方正隶变简体：排版参数与 sc-style 一致，但不启用小字回退
export default deriveStyle(scStyle, {
  fontFamily: 'ygo-fzlb',
  dropDescription: ['smallFontSize'],
});
