import assert from 'node:assert/strict';
import test from 'node:test';
import { inheritProp } from '../index.js';

// inheritProp 依赖内部 isPlainObject 判断是否递归，
// 这些用例锚定该判定的语义（原由 lodash-unified 提供，现已自实现）。

test('inheritProp 让子对象继承父级的排版属性', () => {
  const style = inheritProp({
    fontFamily: 'ygo-sc',
    fontSize: 24,
    name: { top: 97 },
  });
  assert.equal(style.name.fontFamily, 'ygo-sc');
  assert.equal(style.name.fontSize, 24);
  assert.equal(style.name.top, 97);
});

test('inheritProp 不覆盖子对象已有的属性', () => {
  const style = inheritProp({
    fontFamily: 'ygo-sc',
    name: { fontFamily: 'ygo-sc-name' },
  });
  assert.equal(style.name.fontFamily, 'ygo-sc-name');
});

test('inheritProp 逐层向下继承', () => {
  const style = inheritProp({
    fontFamily: 'ygo-sc',
    level: { text: { top: 247 } },
  });
  assert.equal(style.level.fontFamily, 'ygo-sc');
  assert.equal(style.level.text.fontFamily, 'ygo-sc');
});

test('inheritProp 不递归进入数组与类实例', () => {
  const style = inheritProp({
    fontFamily: 'ygo-sc',
    list: [{ top: 1 }],
    stamp: new Date(0),
  });
  assert.equal(style.list[0].fontFamily, undefined);
  assert.equal(style.stamp.fontFamily, undefined);
  assert.equal(style.list.length, 1);
});

test('inheritProp 递归进入 Object.create(null) 对象', () => {
  const plain = Object.create(null);
  plain.top = 1;
  const style = inheritProp({ fontFamily: 'ygo-sc', block: plain });
  assert.equal(style.block.fontFamily, 'ygo-sc');
});