import { deriveStyle } from '../../utils/style.js';
import jpStyle from './jp-style.js';

// FOT-Rodin Pro M（日文ゴシック体）：排版参数与 jp-style 完全一致，只换字体族
export default deriveStyle(jpStyle, { fontFamily: 'ygo-jp-rodin' });
