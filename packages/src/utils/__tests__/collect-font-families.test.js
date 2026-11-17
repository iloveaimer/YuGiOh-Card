import assert from 'node:assert/strict';
import test from 'node:test';
import { collectFontFamilies } from '../index.js';

test('collectFontFamilies 递归收集 fontFamily / rtFontFamily', () => {
  const style = {
    fontFamily: 'ygo-sc',
    name: { fontFamily: 'ygo-sc-name', top: 97 },
    description: { nested: { rtFontFamily: 'ygo-tip' } },
    unrelated: { size: 10 },
  };
  assert.deepEqual(
    collectFontFamilies(style).sort(),
    ['ygo-sc', 'ygo-sc-name', 'ygo-tip'].sort(),
  );
});

test('collectFontFamilies 忽略空值与非字符串', () => {
  assert.deepEqual(collectFontFamilies({ fontFamily: '', rtFontFamily: null }), []);
  assert.deepEqual(collectFontFamilies({ name: { top: 97 } }), []);
  assert.deepEqual(collectFontFamilies(null), []);
  assert.deepEqual(collectFontFamilies(undefined), []);
  assert.deepEqual(collectFontFamilies({}), []);
});

test('collectFontFamilies 对同一字体族去重', () => {
  const style = { fontFamily: 'ygo-jp', name: { fontFamily: 'ygo-jp' } };
  assert.deepEqual(collectFontFamilies(style), ['ygo-jp']);
});