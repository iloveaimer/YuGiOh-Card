import assert from 'node:assert/strict';
import test from 'node:test';
import { numberToFull } from '../index.js';

// 回归：Astral 模式下 atk/def/连接箭头数量是 number 类型，
// 旧实现直接调用 value.replace 会抛 TypeError 导致整条数值栏渲染失败。
test('numberToFull 支持 number 入参', () => {
  assert.equal(numberToFull(3000), '３０００');
  assert.equal(numberToFull(2500), '２５００');
  assert.equal(numberToFull(0), '０');
  assert.equal(numberToFull(8), '８');
});

test('numberToFull 支持 string 入参并保留非数字字符', () => {
  assert.equal(numberToFull('3000'), '３０００');
  assert.equal(numberToFull('ATK3000'), 'ATK３０００');
});

test('numberToFull 对空值返回空字符串', () => {
  assert.equal(numberToFull(''), '');
  assert.equal(numberToFull(null), '');
  assert.equal(numberToFull(undefined), '');
});

test('numberToFull 不转换非数字符号', () => {
  assert.equal(numberToFull('?'), '?');
  assert.equal(numberToFull('∞'), '∞');
});