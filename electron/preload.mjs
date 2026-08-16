import { contextBridge } from 'electron';
import { join } from 'node:path';

/**
 * 向渲染进程暴露 resourcePath：
 * - 开发模式：Vite dev server 从 src/ 提供文件（走 HTTP）
 * - 生产模式：assets 在打包输出目录，用绝对路径避免相对路径受 cwd 影响。
 *   注意：vite-plugin-electron 会把 preload 编译成 CJS，此时 __dirname 可用；
 *   不能用 import.meta.url（会被错误转译为 {}.url = undefined 导致崩溃）。
 */
contextBridge.exposeInMainWorld('__YG__', {
  resourcePath: process.env.VITE_DEV_SERVER_URL
    ? '/src/assets/yugioh-card'
    : join(__dirname, '../dist/assets/src/assets/yugioh-card'),
});
