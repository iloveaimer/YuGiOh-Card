import { Text, Image, ImageEvent, Leafer, useCanvas } from 'leafer-unified';
import { isBrowser, isNode, loadFontBrowser, loadFontNode } from '../utils/index.js';
import loaderIconUrl from '../svg/loader.js';
import imageIconUrl from '../svg/image.js';

const fontPathMap = {
  YugiohCard: '/yugioh/font',
  YugiohSeries2Card: '/yugioh/font',
  RushDuelCard: '/rush-duel/font',
};

const resetAttr = () => {
  Text.changeAttr('lineHeight', {
    type: 'percent',
    value: 1.15,
  });
};

export class Card {
  leafer = null;
  imageStatusLeaf = null;
  cardWidth = 100;
  cardHeight = 100;
  data = {};
  view = null;
  resourcePath = null;
  skia = null;
  fontReady = null;
  fontLoaded = false;

  constructor(data = {}) {
    this.view = data.view;
    this.resourcePath = data.resourcePath;
    this.skia = data.skia;
    resetAttr();

    if (isNode) {
      if (!this.skia) {
        throw new Error('skia-canvas is required in Node environment');
      }
      useCanvas('skia', this.skia);
    }

    const fontPath = fontPathMap[this.tag];
    if (fontPath) {
      if (isNode) {
        loadFontNode(`${this.resourcePath}${fontPath}`, this.skia); // 同步
        this.fontLoaded = true;
      } else {
        // 异步加载字体，保存 Promise；加载完成后重绘（字体就绪后再绘制保证测量准确）
        this.fontReady = loadFontBrowser(`${this.resourcePath}${fontPath}`).then(() => {
          this.fontLoaded = true;
          this.draw();
        }).catch(err => {
          // 字体加载失败时降级：标记为已加载并重绘，使用系统默认字体渲染，避免卡片完全不显示
          console.error('[Card] 字体加载失败，降级为系统字体:', err);
          this.fontLoaded = true;
          this.draw();
        });
      }
    } else {
      this.fontLoaded = true;
    }
  }

  setData(data = {}) {
    // 使用解构赋值创建新对象，避免 reactive proxy 导致的数据污染
    this.data = { ...this.data, ...data };
    // 字体未加载完成时，等待字体就绪后再重绘（否则语言切换会用未就绪字体渲染失败）
    if (!this.fontLoaded && this.fontReady) {
      this.fontReady.then(() => this.draw());
      return;
    }
    this.draw();
  }

  initLeafer() {
    this.leafer = new Leafer({
      view: this.view,
      width: this.cardWidth,
      height: this.cardHeight,
    });
  }

  draw() {
    // need to be overridden
  }

  listenImageStatus(imageLeaf) {
    if (isNode) {
      return;
    }
    imageLeaf.on(ImageEvent.LOAD, () => {
      this.drawImageStatus(imageLeaf, ImageEvent.LOAD);
    });
    imageLeaf.on(ImageEvent.LOADED, () => {
      this.drawImageStatus(imageLeaf, ImageEvent.LOADED);
    });
    imageLeaf.on(ImageEvent.ERROR, () => {
      this.drawImageStatus(imageLeaf, ImageEvent.ERROR);
    });
  }

  drawImageStatus(imageLeaf, status) {
    const { url, width, height, x, y, zIndex } = imageLeaf;
    if (!this.imageStatusLeaf) {
      this.imageStatusLeaf = new Image();
      this.leafer.add(this.imageStatusLeaf);
    }

    let statusUrl = '';
    if (status === ImageEvent.LOAD) {
      statusUrl = loaderIconUrl;
    } else if (status === ImageEvent.ERROR) {
      statusUrl = imageIconUrl;
    }

    this.imageStatusLeaf.set({
      url: statusUrl,
      width: 120,
      height: 120,
      around: 'center',
      x: x + width / 2,
      y: y + height / 2,
      visible: [ImageEvent.LOAD, ImageEvent.ERROR].includes(status) && url,
      zIndex: zIndex + 1,
    });
  }

  updateScale() {
    const pixelRatio = isBrowser ? devicePixelRatio : 1;
    this.leafer.pixelRatio = pixelRatio;
    this.leafer.width = this.cardWidth * this.data.scale / pixelRatio;
    this.leafer.height = this.cardHeight * this.data.scale / pixelRatio;
    this.leafer.scaleX = this.data.scale / pixelRatio;
    this.leafer.scaleY = this.data.scale / pixelRatio;
  }
}
