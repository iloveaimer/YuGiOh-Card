// 导出像素上限：单边与总面积同时约束。RGBA 缓冲按 4 字节/像素计，
// 6400 万像素约 256 MB；超过浏览器画布上限时导出会失败。
export const MAX_EXPORT_SIDE = 8192;
export const MAX_EXPORT_AREA = 64 * 1024 * 1024;

/**
 * 计算导出实际可用的像素缩放。
 *
 * 传入手绘图层当前的逻辑尺寸、用户选择的倍率与设备像素比，
 * 返回被上限裁剪后的倍率以及是否发生降档。
 *
 * @param {number} baseWidth 手绘图层逻辑宽度。
 * @param {number} baseHeight 手绘图层逻辑高度。
 * @param {number} scale 用户选择的导出倍率。
 * @param {number} pixelRatio 设备像素比。
 * @returns {{ ratio: number, downscaled: boolean }} 实际倍率与降档标记。
 */
export const clampExportRatio = (baseWidth, baseHeight, scale, pixelRatio) => {
  const width = Math.max(1, baseWidth || 0);
  const height = Math.max(1, baseHeight || 0);
  const requested = Math.max(1, scale || 0) * Math.max(1, pixelRatio || 0);
  const limited = Math.min(
    requested,
    MAX_EXPORT_SIDE / Math.max(width, height),
    Math.sqrt(MAX_EXPORT_AREA / (width * height)),
  );
  return {
    ratio: limited,
    downscaled: limited < requested - 0.001,
  };
};
