import test from 'node:test';
import assert from 'node:assert/strict';
import { isForeignCard, normalizeForeignCard } from '../card-format.js';

test('本项目数据不判定为外部格式', () => {
  assert.equal(isForeignCard({ cardType: 'normal', description: 'x' }), false);
});

test('缺少 cardType 且带 desc 时判定为外部格式', () => {
  assert.equal(isForeignCard({ desc: '效果文本', atk: 3000 }), true);
  assert.equal(isForeignCard({ cardName: '青眼白龙' }), true);
  assert.equal(isForeignCard(null), false);
  assert.equal(isForeignCard([{ desc: 'x' }]), false);
});

test('外部字段按别名归一', () => {
  const result = normalizeForeignCard({
    cardName: '青眼白龙',
    desc: '效果：破坏卡片',
    ATK: '3000',
    DEF: '2500',
    stars: '8',
    passcode: ' 89631139 ',
    art: 'https://example.com/a.png',
  });
  assert.deepEqual(result, {
    name: '青眼白龙',
    description: '效果：破坏卡片',
    atk: 3000,
    def: 2500,
    level: 8,
    password: '89631139',
    image: 'https://example.com/a.png',
  });
});

test('非法数值被丢弃，不写入 NaN', () => {
  const result = normalizeForeignCard({ desc: 'x', atk: '?', def: '-2' });
  assert.equal('atk' in result, false);
  assert.equal(result.def, -2);
});

test('不认识的字段不会混入', () => {
  const result = normalizeForeignCard({ desc: 'x', attribute: 'LIGHT', race: 'Dragon' });
  assert.equal('attribute' in result, false);
  assert.equal('race' in result, false);
});
