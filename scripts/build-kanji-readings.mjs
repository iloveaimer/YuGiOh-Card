// 由公开汉字数据生成精简读音表。
//
// 用法：node scripts/build-kanji-readings.mjs --source <kanji.json 路径>
//
// 源数据为 KANJIDIC2 的 JSON 导出版（字符 → 音读/训读），
// 生成结果只保留常用字（学年 1-6/8 或使用频率前 2500），
// 每字最多保留 2 个音读与 2 个训读词干，以控制在 100 KB 以内。
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const sourceIndex = args.indexOf('--source');
if (sourceIndex === -1 || !args[sourceIndex + 1]) {
  console.error('缺少 --source 参数');
  process.exit(1);
}

const sourcePath = args[sourceIndex + 1];
const targetPath = path.resolve('src/data/kanji-readings.js');

const toHiragana = value => value.replace(/[\u30A1-\u30F6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60));

const trimReading = value => {
  // 训读条目可能带词缀标记（前后减号）与送假名（点后部分），只保留可注音的词干
  const stem = value.split('.')[0].replace(/^-+/, '').replace(/-+$/, '');
  return toHiragana(stem);
};

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
const result = {};
let kept = 0;

for (const [char, info] of Object.entries(source)) {
  const grade = info.grade;
  // 只保留常用汉字（学年 1-6 与常用汉字表）。人名用汉字与生僻字不参与逐字推测，
  // 它们出现频率低，混进来只会让读音表膨胀并引入误读。
  const common = (grade >= 1 && grade <= 6) || grade === 8;
  if (!common) {
    continue;
  }
  const on = [...new Set((info.readings_on || []).map(toHiragana).filter(Boolean))].slice(0, 2);
  const kun = [...new Set((info.readings_kun || []).map(trimReading).filter(Boolean))].slice(0, 2);
  if (!on.length && !kun.length) {
    continue;
  }
  if (on.concat(kun).some(reading => reading.includes('\uFFFD'))) {
    continue;
  }
  result[char] = `${on.join(',')}|${kun.join(',')}`;
  kept++;
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
const banner = [
  '// 由 scripts/build-kanji-readings.mjs 生成，请勿手工编辑。',
  '// 数据来源：KANJIDIC2（EDRDG，CC BY-SA 4.0），经 kanji-data 的 JSON 导出版整理。',
  '// 格式：汉字 -> 「音读1,音读2|训读1,训读2」，训读已去除送假名与词缀标记。',
  '',
].join('\n');
fs.writeFileSync(targetPath, `${banner}export default ${JSON.stringify(result)};\n`, 'utf-8');
const size = fs.statSync(targetPath).size;
console.log(`已生成 ${targetPath}：${kept} 字，${(size / 1024).toFixed(1)} KB`);
