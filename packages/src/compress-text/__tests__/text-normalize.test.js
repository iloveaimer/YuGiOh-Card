import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCardText } from '../text-normalize.js';

test('normalizeCardText converts fullwidth alnum and space to halfwidth', () => {
  assert.equal(
    normalizeCardText('ＡＢＣ　１２３'),
    'ABC 123',
  );
});

test('normalizeCardText keeps CJK fullwidth punctuation untouched', () => {
  assert.equal(
    normalizeCardText('青眼の白龍、攻撃力３０００！'),
    '青眼の白龍、攻撃力3000！',
  );
});

test('normalizeCardText converts straight quotes to curly quotes', () => {
  assert.equal(
    normalizeCardText('"Hello" and \'world\''),
    '\u201CHello\u201D and \u2018world\u2019',
  );
});

test('normalizeCardText converts double hyphen to em dash', () => {
  assert.equal(normalizeCardText('a--b'), 'a\u2014b');
});

test('normalizeCardText removes spaces after bullet', () => {
  assert.equal(normalizeCardText('● 效果一'), '●效果一');
});

test('normalizeCardText converts parenthesized number to circled', () => {
  assert.equal(normalizeCardText('(1)(15)(20)'), '①⑮⑳');
  assert.equal(normalizeCardText('(21)'), '(21)');
});

test('normalizeCardText handles empty and null input', () => {
  assert.equal(normalizeCardText(''), '');
  assert.equal(normalizeCardText(null), null);
  assert.equal(normalizeCardText(undefined), undefined);
});
