import { Text, Image, ImageEvent, Leafer, useCanvas } from 'leafer-unified';
import { collectFontFamilies, isBrowser, isNode, loadFontBrowser, loadFontNode } from '../utils/index.js';
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
  fontPath = null;
  fontReady = null;
  fontLoaded = false;
  // 已请求过的字体族（含加载失败的），用于判断切换语言/字体后是否需要补载
  requestedFontFamilies = new Set();

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
      this.fontPath = `${this.resourcePath}${fontPath}`;
      if (isNode) {
        loadFontNode(this.fontPath, this.skia); // 同步
        this.fontLoaded = true;
      } else {
        // 异步加载字体，保存 Promise；加载完成后重绘（字体就绪后再绘制保证测量准确）
        // 只加载当前样式实际用到的字体族，其余字体在切换语言/字体时按需补载。
        // 注意：子类字段（this.data）在基类构造函数执行时尚未初始化，
        // 因此字体族必须放到微任务里计算，否则会被误判为默认语言样式。
        this.fontReady = Promise.resolve().then(() => this.loadFonts(this.fontFamilies)).then(() => {
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

  // 本次渲染实际需要的字体族：默认从样式树收集，子类可追加代码里直接引用的字体
  get fontFamilies() {
    return this.style ? collectFontFamilies(this.style) : [];
  }

  // 加载尚未请求过的字体族；已全部请求过时立即完成
  loadFonts(families) {
    const pending = families.filter(family => !this.requestedFontFamilies.has(family));
    families.forEach(family => this.requestedFontFamilies.add(family));
    if (!pending.length) {
      return Promise.resolve();
    }
    return loadFontBrowser(this.fontPath, pending);
  }

  setData(data = {}) {
    // 使用解构赋值创建新对象，避免 reactive proxy 导致的数据污染
    this.data = { ...this.data, ...data };
    if (!this.fontPath || isNode) {
      this.draw();
      return;
    }
    // 首次字体加载未完成时，等就绪后重新走一遍本方法：
    // 此时 data 已更新，能准确判定是否需要补载新语言/新字体的字体族
    if (!this.fontLoaded && this.fontReady) {
      this.fontReady.then(() => this.setData({}));
      return;
    }
    // 语言/字体切换后可能引入新的字体族，补齐后再绘制，保证测量准确
    const families = this.fontFamilies;
    if (families.some(family => !this.requestedFontFamilies.has(family))) {
      this.loadFonts(families).then(() => this.draw()).catch(() => this.draw());
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

  // 依次执行绘制步骤；单步失败不影响后续步骤，避免一处异常导致整张卡片空白
  runDrawSteps(steps) {
    for (const step of steps) {
      try {
        this[step]();
      } catch (e) {
        console.error(`[${this.tag}] ${step}() 渲染失败:`, e);
      }
    }
  }

  // 取得指定叶子；首次调用时用 Ctor 创建、执行 onCreate（注册事件或填充子节点）后加入场景树。
  // 各 draw 步骤只关心「设置属性」，重复的创建/复用判断集中在这里。
  leaf(prop, Ctor, onCreate) {
    if (!this[prop]) {
      this[prop] = new Ctor();
      if (onCreate) {
        onCreate(this[prop]);
      }
      this.leafer.add(this[prop]);
    }
    return this[prop];
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
    const { url, fill, width, height, x, y, zIndex } = imageLeaf;
    // 卡图叶子是 Rect，图片地址挂在 fill.url 上；只读 url 会让卡图的状态图标永不显示
    const imageUrl = url || fill?.url || '';
    const imageStatusLeaf = this.leaf('imageStatusLeaf', Image);

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
      visible: [ImageEvent.LOAD, ImageEvent.ERROR].includes(status) && !!imageUrl,
      zIndex: zIndex + 1,
    });
  }

  updateScale() {
    const pixelRatio = isBrowser ? devicePixelRatio : 1;
    // scale 缺省时兜底为 1：undefined 参与运算会让画布尺寸变成 NaN
    const scale = this.data.scale ?? 1;
    this.leafer.pixelRatio = pixelRatio;
    this.leafer.width = this.cardWidth * scale / pixelRatio;
    this.leafer.height = this.cardHeight * scale / pixelRatio;
    this.leafer.scaleX = scale / pixelRatio;
    this.leafer.scaleY = scale / pixelRatio;
  }
}
