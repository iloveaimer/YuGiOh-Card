import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeFontStyle } from '../index.js';
import series2JpStyle from '../../yugioh-series-2-card/style/jp-style.js';
import hklsw7Style from '../../yugioh-card/style/hklsw7-style.js';
import enStyle from '../../yugioh-card/style/en-style.js';
import dfgls4Style from '../../yugioh-card/style/dfgls4-style.js';

// 经典卡的字体样式是「经典卡模板坐标 + 字体属性」的混合体，
// 套到系列2 模板上时只能取字体属性，坐标与字号必须沿用系列2 的基准值。

test('保留基准样式的坐标与字号', () => {
  const style = mergeFontStyle(series2JpStyle, hklsw7Style);
  // 经典卡是 name.top 97 / effect.top 1528，系列2 是 136 / 1685
  assert.equal(style.name.top, 136);
  assert.equal(style.effect.top, 1685);
  assert.equal(style.name.fontSize, 114);
  assert.equal(style.effect.fontSize, 50);
  assert.equal(style.description.fontSize, 44);
});

test('套用字体样式的字体族与字距', () => {
  const style = mergeFontStyle(series2JpStyle, hklsw7Style);
  assert.equal(style.fontFamily, 'ygo-hklsw7');
  assert.equal(style.name.fontFamily, 'ygo-hklsw7');
  assert.equal(style.effect.letterSpacing, 2);
  assert.equal(style.description.letterSpacing, 2);
});

test('字体样式在节点上单独指定的字体族优先', () => {
  const style = mergeFontStyle(series2JpStyle, enStyle);
  assert.equal(style.name.fontFamily, 'ygo-en-name');
  assert.equal(style.effect.fontFamily, 'ygo-en-race');
  // 字号仍取系列2 基准，不跟随经典卡的 96 / 40
  assert.equal(style.name.fontSize, 114);
  assert.equal(style.effect.fontSize, 50);
});

test('保留基准样式的坐标类字段，不引入经典卡的图标间距', () => {
  const style = mergeFontStyle(series2JpStyle, hklsw7Style);
  // 经典卡 spellTrap.right 134 / icon.marginLeft 10，系列2 是 155 / 无 marginLeft
  assert.equal(style.spellTrap.right, 155);
  assert.equal(style.spellTrap.icon.marginTop, 10);
  assert.equal(style.spellTrap.icon.marginLeft, undefined);
});

test('注音尺寸跟随字体样式，基准字号不受影响', () => {
  const style = mergeFontStyle(series2JpStyle, dfgls4Style);
  assert.equal(style.name.rtFontSize, 20);
  assert.equal(style.name.rtTop, -2);
  assert.equal(style.name.fontSize, 114);
});

test('基准样式缺少该节点时跳过，不凭空引入', () => {
  const base = { fontFamily: 'base-font', name: { top: 10 } };
  const style = mergeFontStyle(base, {
    fontFamily: 'custom-font',
    pendulumDescription: { top: 1 },
  });
  assert.equal(style.fontFamily, 'custom-font');
  assert.equal(style.name.fontFamily, 'custom-font');
  assert.equal(style.name.top, 10);
  assert.equal(style.pendulumDescription, undefined);
});