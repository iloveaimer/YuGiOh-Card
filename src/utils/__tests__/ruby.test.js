import test from 'node:test';
import assert from 'node:assert/strict';
import { hasRuby, toRubyText } from '../ruby.js';

test('常用卡牌词按词表注音', () => {
  const result = toRubyText('相手フィールドのモンスター１体を対象として発動できる。');
  assert.ok(result.includes('[相手(あいて)]'));
  assert.ok(result.includes('[体(たい)]'));
  assert.ok(result.includes('[対象(たいしょう)]'));
  assert.ok(result.includes('[発動(はつどう)]'));
});

test('单字后接送假名时取训读', () => {
  assert.equal(toRubyText('墓地へ送る'), '[墓地(ぼち)]へ[送(おく)]る');
  assert.equal(toRubyText('手札を捨てる'), '[手札(てふだ)]を[捨(す)]てる');
});

test('单字后接助词时取音读', () => {
  assert.ok(toRubyText('１体を').includes('[体(たい)]'));
});

test('单字词表条目也能命中', () => {
  assert.equal(toRubyText('罠カード'), '[罠(わな)]カード');
  assert.equal(toRubyText('１枚'), '１[枚(まい)]');
});

test('已含注音的文本不再包裹', () => {
  const source = '[既存(きそん)]の注音';
  assert.equal(hasRuby(source), true);
  assert.equal(toRubyText(source), source);
});

test('无汉字文本与空值原样返回', () => {
  assert.equal(toRubyText('カード'), 'カード');
  assert.equal(toRubyText(''), '');
  assert.equal(toRubyText(undefined), '');
});

test('缺读音的汉字保持原样，不产生半截注音', () => {
  const result = toRubyText('龘');
  assert.equal(result, '龘');
});
