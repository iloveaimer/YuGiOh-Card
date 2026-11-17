import test from 'node:test';
import assert from 'node:assert/strict';
import { YGOPRODECK_FRAME, parseOcgType, toPendulumType } from '../ocgData.js';

test('百鸽普通灵摆的卡类为 normal', () => {
  const TYPE_PENDULUM = 0x1000000;
  const result = parseOcgType(TYPE_PENDULUM, 'sc');
  assert.equal(result.type, 'pendulum');
  assert.equal(result.cardType, 'normal');
});

test('百鸽效果灵摆的卡类为 effect', () => {
  const TYPE_PENDULUM = 0x1000000;
  const TYPE_EFFECT = 0x20;
  const result = parseOcgType(TYPE_PENDULUM | TYPE_EFFECT, 'sc');
  assert.equal(result.cardType, 'effect');
});

test('通常灵摆映射为 normal-pendulum，而非 effect-pendulum', () => {
  assert.equal(toPendulumType('normal'), 'normal-pendulum');
  assert.equal(toPendulumType('effect'), 'effect-pendulum');
});

test('空卡类按通常灵摆处理', () => {
  assert.equal(toPendulumType(''), 'normal-pendulum');
  assert.equal(toPendulumType(undefined), 'normal-pendulum');
});

test('两种数据源对通常灵摆产出一致的 pendulumType', () => {
  const fromYgocdb = toPendulumType(parseOcgType(0x1000000, 'sc').cardType);
  const fromYgoprodeck = YGOPRODECK_FRAME.normal_pendulum[1];
  assert.equal(fromYgocdb, fromYgoprodeck);
});
