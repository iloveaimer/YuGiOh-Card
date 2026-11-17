// 生成 PWA 图标（192/512），供 manifest 使用。
//
// 用法：node scripts/generate-icons.mjs
import fs from 'fs';
import path from 'path';
import { Canvas } from 'skia-canvas';

const SIZES = [192, 512];
const BG = '#0b1727';
const FG = '#e8c15a';

const render = size => {
  const canvas = new Canvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);
  // 金色圆环 + 汉字，缩放到画布 72%
  ctx.strokeStyle = FG;
  ctx.lineWidth = Math.round(size * 0.03);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = FG;
  ctx.font = `bold ${Math.round(size * 0.44)}px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('遊', size / 2, size * 0.52);
  return canvas.toBufferSync('png');
};

for (const size of SIZES) {
  const target = path.resolve(`public/icon-${size}.png`);
  fs.writeFileSync(target, render(size));
  console.log(`已生成 ${target}`);
}
