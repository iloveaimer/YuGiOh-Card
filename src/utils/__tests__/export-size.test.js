import test from 'node:test';
import assert from 'node:assert/strict';
import { clampExportRatio } from '../export-size.js';

test('缩放在上限内时原样返回，不标记降档', () => {
  const result = clampExportRatio(697, 1016, 3, 1);
  assert.equal(result.downscaled, false);
  assert.equal(result.ratio, 3);
});

test('50% 视图下 5 倍仍在上限内', () => {
  const result = clampExportRatio(697, 1016, 1, 5);
  assert.equal(result.downscaled, false);
  assert.equal(result.ratio, 5);
});

test('100% 视图下 5 倍触发上限并降档', () => {
  const result = clampExportRatio(1394, 2031, 5, 1);
  const expected = Math.min(8192 / 2031, Math.sqrt(64 * 1024 * 1024 / (1394 * 2031)));
  assert.equal(result.downscaled, true);
  assert.ok(Math.abs(result.ratio - expected) < 1e-9);
  // 两条约束都必须成立：长边不超 8192，总面积不超 6400 万
  assert.ok(result.ratio * 2031 <= 8192 + 1e-6);
  assert.ok(result.ratio * result.ratio * 1394 * 2031 <= 64 * 1024 * 1024 + 1);
});

test('单边超限时按边长裁剪', () => {
  const result = clampExportRatio(2000, 1000, 5, 1);
  assert.equal(result.downscaled, true);
  assert.ok(Math.abs(result.ratio - 8192 / 2000) < 1e-9);
});

test('非法输入不产生 NaN', () => {
  const result = clampExportRatio(0, 0, 0, 0);
  assert.ok(Number.isFinite(result.ratio));
  assert.ok(result.ratio >= 1);
});
