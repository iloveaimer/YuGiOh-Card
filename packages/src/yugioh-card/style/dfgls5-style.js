import { deriveStyle } from '../../utils/style.js';
import jpStyle from './jp-style.js';

// DFG 隶书体 5 号（日文，更粗）：排版参数与 jp-style 完全一致，只换字体族
export default deriveStyle(jpStyle, { fontFamily: 'ygo-jp-dfgls5' });
