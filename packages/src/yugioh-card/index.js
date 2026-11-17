import { Group, Image, Rect, Text } from 'leafer-unified';
import { Card } from '../card/index.js';
import { CompressText } from '../compress-text/index.js';
import { collectFontFamilies, numberToFull } from '../utils/index.js';
import scStyle from './style/sc-style.js';
import tcStyle from './style/tc-style.js';
import jpStyle from './style/jp-style.js';
import krStyle from './style/kr-style.js';
import enStyle from './style/en-style.js';
import astralStyle from './style/astral-style.js';
import custom1Style from './style/custom1-style.js';
import custom2Style from './style/custom2-style.js';
import lsStyle from './style/ls-style.js';
import lsfStyle from './style/lsf-style.js';
import hklsw7Style from './style/hklsw7-style.js';
import hklsw5Style from './style/hklsw5-style.js';
import ktStyle from './style/kt-style.js';
import fzlbStyle from './style/fzlb-style.js';
import hktfw5Style from './style/hktfw5-style.js';
import dfgls4Style from './style/dfgls4-style.js';
import dfgls5Style from './style/dfgls5-style.js';
import rodinStyle from './style/rodin-style.js';

// 将用户自定义字体覆盖到基础 style（逐层浅拷贝，避免污染模块级单例）
function applyCustomFonts(style, cf) {
  const s = { ...style };
  if (cf.name) {
    s.name = { ...(s.name || {}), fontFamily: cf.name };
  }
  if (cf.body) {
    s.fontFamily = cf.body;
    // 正文相关的子字体（英/韩的类型栏、灵摆描述等使用独立 race 字体，一并覆盖）
    ['spellTrap', 'effect', 'description', 'pendulumDescription'].forEach(key => {
      if (s[key]) {
        s[key] = { ...s[key], fontFamily: cf.body };
      }
    });
  }
  return s;
}

// 周年标记素材映射：值 → 素材名（未识别或空值时不显示）
// 同时兼容旧数据 `twentieth: true`
const TWENTIETH_ASSET_MAP = {
  'true': 'twentieth',
  twentieth: 'twentieth',
  twentyfive: 'twentyfive',
};

// 周年标记位置：锚定卡面底边居中，避免硬编码像素坐标随模板尺寸失配
// offsetX 为相对卡面水平中心的偏移，offsetY 为距卡面底边的距离
const TWENTIETH_POSITION = {
  around: { type: 'percent', x: 0.5, y: 1 },
  offsetX: 0,
  offsetY: 141,
};

export class YugiohCard extends Card {
  cardLeaf = null;
  nameLeaf = null;
  attributeLeaf = null;
  levelLeaf = null;
  rankLeaf = null;
  spellTrapLeaf = null;
  imageLeaf = null;
  maskLeaf = null;
  pendulumLeaf = null;
  pendulumDescriptionLeaf = null;
  packageLeaf = null;
  linkArrowLeaf = null;
  effectLeaf = null;
  descriptionLeaf = null;
  atkDefLinkLeaf = null;
  passwordLeaf = null;
  copyrightLeaf = null;
  laserLeaf = null;
  rareLeaf = null;
  attributeRareLeaf = null;
  twentiethLeaf = null;
  cardWidth = 1394;
  cardHeight = 2031;

  data = {
    language: 'sc',
    font: '',
    // 用户自定义字体（三槽位 family 名，由 UI 层注册 FontFace 后传入）
    customFonts: {},
    name: '',
    color: '',
    align: 'left',
    gradient: false,
    gradientColor1: '#999999',
    gradientColor2: '#ffffff',
    type: 'monster',
    attribute: 'dark',
    icon: '',
    image: '',
    cardType: 'normal',
    pendulumType: 'normal-pendulum',
    level: 0,
    rank: 0,
    pendulumScale: 0,
    pendulumDescription: '',
    monsterType: '',
    atkBar: true,
    atk: 0,
    def: 0,
    arrowList: [],
    description: '',
    firstLineCompress: false,
    descriptionAlign: false,
    descriptionZoom: 1,
    descriptionWeight: 0,
    package: '',
    password: '',
    copyright: '',
    laser: '',
    rare: '',
    twentieth: false,
    radius: true,
    scale: 1,
  };

  constructor(data = {}) {
    super(data);

    this.initLeafer();
    this.setData(data.data);
  }

  get tag() {
    return 'YugiohCard';
  }

  draw() {
    this.runDrawSteps([
      'drawCard', 'drawName', 'drawAttribute', 'drawLevel', 'drawRank',
      'drawSpellTrap', 'drawImage', 'drawMask', 'drawPendulum',
      'drawPendulumDescription', 'drawPackage', 'drawLinkArrow',
      'drawEffect', 'drawDescription', 'drawAtkDefLink', 'drawPassword',
      'drawCopyright', 'drawLaser', 'drawRare', 'drawAttributeRare',
      'drawTwentieth', 'updateScale',
    ]);
  }

  cardLeafOnCreate(leaf) {
    this.listenImageStatus(leaf);
  }

  drawName() {
    const { name } = this.style;

    this.leaf('nameLeaf', CompressText).set({
      text: this.data.name,
      fontFamily: name.fontFamily,
      fontSize: name.fontSize,
      letterSpacing: name.letterSpacing || 0,
      wordSpacing: name.wordSpacing || 0,
      textAlign: this.data.align || 'left',
      color: this.data.color || this.autoNameColor,
      gradient: this.data.gradient,
      gradientColor1: this.data.gradientColor1,
      gradientColor2: this.data.gradientColor2,
      rtFontSize: name.rtFontSize,
      rtTop: name.rtTop,
      rtColor: this.autoNameColor,
      // 长卡名自动缩小字号（英文卡名普遍较长，避免横向压扁变形）
      autoSmallSize: true,
      smallFontSize: Math.round(name.fontSize * 0.72),
      width: this.showAttribute ? 1033 : 1161,
      height: 200,
      x: 116,
      y: name.top,
      zIndex: 10,
    });
  }

  drawAttribute() {
    this.leaf('attributeLeaf', Image).set({
      url: this.attributeUrl,
      x: 1163,
      y: 96,
      visible: this.showAttribute,
      zIndex: 10,
    });
  }

  drawLevel() {
    const levelLeaf = this.leaf('levelLeaf', Group, group => {
      for (let i = 0; i < 13; i++) {
        group.add(new Image());
      }
    });

    const levelUrl = `${this.baseImage}/level.png`;
    const levelWidth = 88;
    const right = this.data.level < 13 ? 147 : 101;
    levelLeaf.children.forEach((level, index) => {
      level.set({
        url: levelUrl,
        x: this.cardWidth - right - index * (levelWidth + 4),
        y: 247,
        around: { type: 'percent', x: 1, y: 0 },
        visible: index < this.data.level,
      });
    });

    levelLeaf.set({
      visible: this.showLevel,
      zIndex: 10,
    });
  }

  drawRank() {
    const rankLeaf = this.leaf('rankLeaf', Group, group => {
      for (let i = 0; i < 13; i++) {
        group.add(new Image());
      }
    });

    const rankUrl = `${this.baseImage}/rank.png`;
    const rankWidth = 88;
    const left = this.data.rank < 13 ? 147 : 101;
    rankLeaf.children.forEach((rank, index) => {
      rank.set({
        url: rankUrl,
        x: left + index * (rankWidth + 4),
        y: 247,
        visible: index < this.data.rank,
      });
    });

    rankLeaf.set({
      visible: this.showRank,
      zIndex: 10,
    });
  }

  drawSpellTrap() {
    const spellTrapLeaf = this.leaf('spellTrapLeaf', Group, group => {
      group.add(new CompressText());
      group.add(new Image());
      group.add(new CompressText());
    });

    const { spellTrap } = this.style;
    const { icon } = spellTrap;

    const iconUrl = this.data.icon ? `${this.baseImage}/icon-${this.data.icon}.png` : '';
    const iconWidth = this.data.icon ? 72 : 0;
    const leftBracket = ['en', 'kr'].includes(this.data.language) ? '[' : '【';
    const rightBracket = ['en', 'kr'].includes(this.data.language) ? ']' : '】';
    const letterSpacing = spellTrap.letterSpacing || 0;
    const wordSpacing = spellTrap.wordSpacing || 0;

    const rightText = spellTrapLeaf.children[0];
    const spellTrapIcon = spellTrapLeaf.children[1];
    const leftText = spellTrapLeaf.children[2];

    rightText.set({
      text: rightBracket,
      fontFamily: spellTrap.fontFamily,
      fontSize: spellTrap.fontSize,
      letterSpacing,
      wordSpacing,
      scaleY: spellTrap.scaleY || 1,
      y: spellTrap.top,
    });
    const rightBounds = rightText.bounds;
    rightText.x = this.cardWidth - spellTrap.right - rightBounds.width;

    spellTrapIcon.set({
      url: iconUrl,
      x: rightText.x - (this.data.icon ? (icon.marginRight || 0) : 0) - iconWidth,
      y: spellTrap.top + (icon.marginTop || 0),
    });

    leftText.set({
      text: leftBracket + this.spellTrapName,
      fontFamily: spellTrap.fontFamily,
      fontSize: spellTrap.fontSize,
      letterSpacing,
      wordSpacing,
      scaleY: spellTrap.scaleY || 1,
      rtFontSize: spellTrap.rtFontSize,
      rtTop: spellTrap.rtTop,
      rtFontScaleX: spellTrap.rtFontScaleX || 1,
      y: spellTrap.top,
    });
    const leftBounds = leftText.bounds;
    leftText.x = spellTrapIcon.x - (this.data.icon ? (icon.marginLeft || 0) : 0) - leftBounds.width;

    spellTrapLeaf.set({
      visible: ['spell', 'trap'].includes(this.data.type),
      zIndex: 10,
    });
  }

  drawImage() {
    const pendulum = this.data.type === 'pendulum';
    super.drawImage({
      width: pendulum ? 1205 : 1054,
      height: pendulum ? 1205 : 1054,
      x: pendulum ? 94 : 170,
      y: pendulum ? 364 : 375,
      visible: this.data.image,
    });
  }

  drawMask() {
    const maskUrl = this.data.type === 'pendulum' ? `${this.baseImage}/card-mask-pendulum.png` : `${this.baseImage}/card-mask.png`;
    this.leaf('maskLeaf', Image).set({
      url: maskUrl,
      x: this.data.type === 'pendulum' ? 68 : 117,
      y: this.data.type === 'pendulum' ? 342 : 322,
      zIndex: 20,
    });
  }

  drawPendulum() {
    const pendulumLeaf = this.leaf('pendulumLeaf', Group, group => {
      group.add(new Text());
      group.add(new Text());
    });

    const leftPendulum = pendulumLeaf.children[0];
    const rightPendulum = pendulumLeaf.children[1];

    let left = this.data.language === 'astral' ? 144 : 145;
    leftPendulum.set({
      text: this.data.pendulumScale,
      fontFamily: this.atkDefFontFamily,
      fontSize: this.data.language === 'astral' ? 84 : 98,
      fill: 'black',
      letterSpacing: this.data.language === 'astral' ? 0 : -10,
      x: left,
      y: this.data.language === 'astral' ? 1389 : 1370,
      around: { type: 'percent', x: 0.5, y: 0 },
    });

    left = this.data.language === 'astral' ? 1250 : 1249;
    rightPendulum.set({
      text: this.data.pendulumScale,
      fontFamily: this.atkDefFontFamily,
      fontSize: this.data.language === 'astral' ? 84 : 98,
      fill: 'black',
      letterSpacing: this.data.language === 'astral' ? 0 : -10,
      x: left,
      y: this.data.language === 'astral' ? 1389 : 1370,
      around: { type: 'percent', x: 0.5, y: 0 },
    });

    pendulumLeaf.set({
      visible: this.data.type === 'pendulum',
      zIndex: 30,
    });
  }

  drawPendulumDescription() {
    const { pendulumDescription } = this.style;

    this.leaf('pendulumDescriptionLeaf', CompressText).set({
      text: this.data.pendulumDescription,
      fontFamily: pendulumDescription.fontFamily,
      fontSize: pendulumDescription.fontSize,
      fontScale: this.data.descriptionZoom,
      strokeWidth: this.data.descriptionWeight,
      lineHeight: pendulumDescription.lineHeight,
      letterSpacing: pendulumDescription.letterSpacing || 0,
      wordSpacing: pendulumDescription.wordSpacing || 0,
      rtFontSize: pendulumDescription.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: pendulumDescription.rtTop,
      width: 950,
      height: 230,
      x: 221,
      y: pendulumDescription.top,
      visible: this.data.type === 'pendulum',
      zIndex: 30,
    });
  }

  drawPackage() {
    const packageLeaf = this.leaf('packageLeaf', CompressText);
    packageLeaf.set({
      text: this.data.package,
      fontFamily: this.passwordFontFamily,
      fontSize: 40,
      color: this.data.type === 'monster' && this.data.cardType === 'xyz' ? 'white' : 'black',
      textAlign: this.data.type === 'pendulum' ? 'left' : 'right',
      y: this.data.type === 'pendulum' ? 1859 : 1455,
      zIndex: 30,
    });
    if (this.data.type === 'pendulum') {
      packageLeaf.x = 116;
    } else {
      const bounds = packageLeaf.bounds;
      const right = this.data.type === 'monster' && this.data.cardType === 'link' ? 252 : 148;
      packageLeaf.x = this.cardWidth - right - bounds.width;
    }
  }

  drawLinkArrow() {
    this.leaf('linkArrowLeaf', Group, group => {
      for (let i = 0; i < 8; i++) {
        group.add(new Image());
      }
    });

    const arrowOnList = [
      { x: 555, y: 278, url: this.baseImage + '/arrow-up-on.png' },
      { x: 1130, y: 299, url: this.baseImage + '/arrow-right-up-on.png' },
      { x: 1223, y: 761, url: this.baseImage + '/arrow-right-on.png' },
      { x: 1130, y: 1336, url: this.baseImage + '/arrow-right-down-on.png' },
      { x: 555, y: 1428, url: this.baseImage + '/arrow-down-on.png' },
      { x: 95, y: 1336, url: this.baseImage + '/arrow-left-down-on.png' },
      { x: 71, y: 758, url: this.baseImage + '/arrow-left-on.png' },
      { x: 95, y: 299, url: this.baseImage + '/arrow-left-up-on.png' },
    ];

    const arrowOffList = [
      { x: 555, y: 278, url: this.baseImage + '/arrow-up-off.png' },
      { x: 1130, y: 299, url: this.baseImage + '/arrow-right-up-off.png' },
      { x: 1223, y: 761, url: this.baseImage + '/arrow-right-off.png' },
      { x: 1130, y: 1336, url: this.baseImage + '/arrow-right-down-off.png' },
      { x: 555, y: 1428, url: this.baseImage + '/arrow-down-off.png' },
      { x: 95, y: 1336, url: this.baseImage + '/arrow-left-down-off.png' },
      { x: 71, y: 758, url: this.baseImage + '/arrow-left-off.png' },
      { x: 95, y: 299, url: this.baseImage + '/arrow-left-up-off.png' },
    ];

    this.linkArrowLeaf.children.forEach((arrow, index) => {
      const showArrow = this.data.arrowList?.includes(index + 1);
      arrow.set({
        url: showArrow ? arrowOnList[index].url : arrowOffList[index].url,
        x: showArrow ? arrowOnList[index].x : arrowOffList[index].x,
        y: showArrow ? arrowOnList[index].y : arrowOffList[index].y,
      });
    });

    this.linkArrowLeaf.set({
      visible: this.data.type === 'monster' && this.data.cardType === 'link',
      zIndex: 120,
    });
  }

  drawEffect() {
    const { effect } = this.style;

    const leftBracket = ['en', 'kr'].includes(this.data.language) ? '[' : '【';
    const rightBracket = ['en', 'kr'].includes(this.data.language) ? ']' : '】';

    this.leaf('effectLeaf', CompressText).set({
      text: leftBracket + this.data.monsterType + rightBracket,
      fontFamily: effect.fontFamily,
      fontSize: effect.fontSize,
      strokeWidth: this.data.descriptionWeight,
      lineHeight: effect.lineHeight,
      letterSpacing: effect.letterSpacing || 0,
      wordSpacing: effect.wordSpacing || 0,
      rtFontSize: effect.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: effect.rtTop,
      width: 1175,
      height: 100,
      x: 109 + (effect.textIndent || 0),
      y: effect.top,
      visible: this.showEffect,
      zIndex: 30,
    });
  }

  drawDescription() {
    const { effect, description } = this.style;

    let effectHeight = effect.minHeight || 0;
    if (this.showEffect) {
      effectHeight = effect.fontSize * effect.lineHeight;
    }

    let fontFamily = description.fontFamily;
    if (this.data.language === 'en' && !this.data.font &&
      ((this.data.type === 'monster' && this.data.cardType === 'normal') || (this.data.type === 'pendulum' && this.data.pendulumType === 'normal-pendulum'))) {
      fontFamily = 'ygo-en-italic';
    }

    let height = 440;
    if (!['spell', 'trap'].includes(this.data.type)) {
      if (this.showEffect) {
        height -= effectHeight;
      }
      if (this.data.atkBar) {
        height -= 60;
      }
    }

    this.leaf('descriptionLeaf', CompressText).set({
      text: this.data.description,
      fontFamily,
      fontSize: description.fontSize,
      fontScale: this.data.descriptionZoom,
      textAlign: this.data.descriptionAlign ? 'center' : 'justify',
      firstLineCompress: this.data.firstLineCompress,
      strokeWidth: this.data.descriptionWeight,
      lineHeight: description.lineHeight,
      letterSpacing: description.letterSpacing || 0,
      wordSpacing: description.wordSpacing || 0,
      rtFontSize: description.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: description.rtTop,
      autoSmallSize: !!description.smallFontSize,
      smallFontSize: description.smallFontSize,
      width: 1175,
      height,
      x: 109,
      y: effect.top + effectHeight,
      zIndex: 30,
    });
  }

  drawAtkDefLink() {
    const atkDefLinkLeaf = this.leaf('atkDefLinkLeaf', Group, group => {
      group.add(new Image());
      group.add(new Text());
      group.add(new Text());
      group.add(new Text());
    });

    const atkDefLinkImage = atkDefLinkLeaf.children[0];
    const atk = atkDefLinkLeaf.children[1];
    const def = atkDefLinkLeaf.children[2];
    const link = atkDefLinkLeaf.children[3];
    atkDefLinkImage.set({
      url: this.atkDefLinkUrl,
      x: 109,
      y: 1844,
    });

    let atkText = '';
    if (this.data.atk >= 0) {
      atkText = this.data.language === 'astral' ? numberToFull(this.data.atk) : this.data.atk;
    } else if (this.data.atk === -1) {
      atkText = '?';
    } else if (this.data.atk === -2) {
      atkText = '∞';
    }
    const atkLeft = this.data.language === 'astral' ? 898 : 999;
    atk.set({
      text: atkText,
      fontFamily: this.atkDefFontFamily,
      fontSize: this.data.language === 'astral' ? 49 : 62,
      fill: 'black',
      letterSpacing: this.data.language === 'astral' ? 0 : 2,
      x: atkLeft,
      y: this.data.language === 'astral' ? 1850 : 1839,
      around: { type: 'percent', x: 1, y: 0 },
      visible: ['monster', 'pendulum'].includes(this.data.type),
    });

    let defText = '';
    if (this.data.def >= 0) {
      defText = this.data.language === 'astral' ? numberToFull(this.data.def) : this.data.def;
    } else if (this.data.def === -1) {
      defText = '?';
    } else if (this.data.def === -2) {
      defText = '∞';
    }
    const defLeft = this.data.language === 'astral' ? 1279 : 1282;
    def.set({
      text: defText,
      fontFamily: this.atkDefFontFamily,
      fontSize: this.data.language === 'astral' ? 49 : 62,
      fill: 'black',
      letterSpacing: this.data.language === 'astral' ? 0 : 2,
      x: defLeft,
      y: this.data.language === 'astral' ? 1850 : 1839,
      around: { type: 'percent', x: 1, y: 0 },
      visible: (this.data.type === 'monster' && this.data.cardType !== 'link') || this.data.type === 'pendulum',
    });

    const arrowLen = this.data.arrowList?.length ?? 0;
    const linkText = this.data.language === 'astral' ? numberToFull(arrowLen) : arrowLen;
    const linkLeft = this.data.language === 'astral' ? 1279 : 1280;
    link.set({
      text: linkText,
      fontFamily: this.linkFontFamily,
      fontSize: this.data.language === 'astral' ? 49 : 44,
      fill: 'black',
      letterSpacing: this.data.language === 'astral' ? 0 : 2,
      x: linkLeft,
      y: this.data.language === 'astral' ? 1850 : 1855,
      around: { type: 'percent', x: 1, y: 0 },
      scaleX: this.data.language === 'astral' ? 1 : 1.3,
      visible: this.data.type === 'monster' && this.data.cardType === 'link',
    });

    atkDefLinkLeaf.set({
      visible: this.showAtkDefLink,
      zIndex: 30,
    });
  }

  drawPassword() {
    this.leaf('passwordLeaf', CompressText).set({
      text: this.data.password,
      fontFamily: this.passwordFontFamily,
      fontSize: 40,
      color: this.data.type === 'monster' && this.data.cardType === 'xyz' ? 'white' : 'black',
      x: 66,
      y: 1932,
      zIndex: 30,
    });
  }

  drawCopyright() {
    const color = this.data.type === 'monster' && this.data.cardType === 'xyz' ? 'white' : 'black';
    const copyrightUrl = this.data.copyright ? `${this.baseImage}/copyright-${this.data.copyright}-${color}.svg` : '';
    this.leaf('copyrightLeaf', Image).set({
      url: copyrightUrl,
      x: this.cardWidth - 141,
      y: 1936,
      around: { type: 'percent', x: 1, y: 0 },
      visible: this.data.copyright,
      zIndex: 30,
    });
  }

  drawLaser() {
    const laserUrl = this.laserUrl;
    this.leaf('laserLeaf', Image).set({
      url: laserUrl,
      x: this.cardWidth - 119,
      y: this.cardHeight - 120,
      around: { type: 'percent', x: 1, y: 1 },
      visible: this.data.laser,
      zIndex: 120,
    });
  }

  drawRare() {
    const suffix = this.data.type === 'pendulum' ? '-pendulum' : '';
    const supportedRare = ['dt', 'ur', 'gr', 'hr', 'ser', 'gser', 'pser'];
    const rareUrl = this.data.rare && supportedRare.includes(this.data.rare)
      ? `${this.baseImage}/rare-${this.data.rare}${suffix}.png` : '';

    this.leaf('rareLeaf', Image).set({
      url: rareUrl,
      cornerRadius: this.data.radius ? 24 : 0,
      visible: !!rareUrl,
      zIndex: 100,
    });
  }

  drawAttributeRare() {
    this.leaf('attributeRareLeaf', Image).set({
      url: `${this.baseImage}/attribute-rare.png`,
      x: 1163,
      y: 96,
      visible: this.showAttributeRare,
      zIndex: 30,
    });
  }

  drawTwentieth() {
    const asset = TWENTIETH_ASSET_MAP[this.data.twentieth] ?? '';
    this.leaf('twentiethLeaf', Image).set({
      url: asset ? `${this.baseImage}/${asset}.png` : '',
      x: this.cardWidth / 2 + TWENTIETH_POSITION.offsetX,
      y: this.cardHeight - TWENTIETH_POSITION.offsetY,
      around: TWENTIETH_POSITION.around,
      visible: !!asset,
      zIndex: 10,
    });
  }

  get baseImage() {
    return `${this.resourcePath}/yugioh/image`;
  }

  get style() {
    let style = {};
    const font = this.data.font;
    const lang = this.data.language;
    // 'custom' 表示使用用户导入的字体，基础样式走语言默认，再叠加自定义字体覆盖；
    // 其余内置字体（custom1/custom2/.../kt）直接映射对应样式。
    if (font && font !== 'custom') {
      if (font === 'custom1') {
        style = custom1Style;
      } else if (font === 'custom2') {
        style = custom2Style;
      } else if (font === 'hklsw7') {
        style = hklsw7Style;
      } else if (font === 'hklsw5') {
        style = hklsw5Style;
      } else if (font === 'xlsj') {
        style = lsStyle;
      } else if (font === 'xlsf') {
        style = lsfStyle;
      } else if (font === 'kt') {
        style = ktStyle;
      } else if (font === 'fzlb') {
        style = fzlbStyle;
      } else if (font === 'hktfw5') {
        style = hktfw5Style;
      } else if (font === 'dfgls4') {
        style = dfgls4Style;
      } else if (font === 'dfgls5') {
        style = dfgls5Style;
      } else if (font === 'rodin') {
        style = rodinStyle;
      }
    }
    // 没有匹配到内置字体时（font 为空/'custom'/未知值），按语言取默认样式
    if (!style.name) {
      if (lang === 'sc') {
        style = scStyle;
      } else if (lang === 'tc') {
        style = tcStyle;
      } else if (lang === 'jp') {
        style = jpStyle;
      } else if (lang === 'kr') {
        style = krStyle;
      } else if (lang === 'en') {
        style = enStyle;
      } else if (lang === 'astral') {
        style = astralStyle;
      } else {
        // 兜底：语言未知时用简体中文样式
        style = scStyle;
      }
    }
    const cf = this.data.customFonts;
    if (font === 'custom' && cf && (cf.name || cf.body)) {
      return applyCustomFonts(style, cf);
    }
    return style;
  }

  // 本次渲染需要的字体族：样式树 + 代码中直接引用、不在样式树内的字体
  get fontFamilies() {
    return [...new Set([
      ...collectFontFamilies(this.style),
      'ygo-tip', // 注音等辅助文本
      'ygo-en-italic', // 英文通常怪兽描述斜体
      this.atkDefFontFamily,
      this.linkFontFamily,
      this.passwordFontFamily,
    ])];
  }

  // 数值字体（ATK/DEF/LINK/灵摆刻度/卡密/包号）：仅在「自定义字体」模式下用用户导入的数值字体
  get numberFont() {
    return this.data.font === 'custom' ? this.data.customFonts?.number : undefined;
  }

  get atkDefFontFamily() {
    return this.numberFont || (this.data.language === 'astral' ? 'ygo-astral' : 'ygo-atk-def');
  }

  get linkFontFamily() {
    return this.numberFont || (this.data.language === 'astral' ? 'ygo-astral' : 'ygo-link');
  }

  get passwordFontFamily() {
    return this.numberFont || 'ygo-password';
  }

  get cardUrl() {
    if (this.data.type === 'monster') {
      return `${this.baseImage}/card-${this.data.cardType}.png`;
    } else if (this.data.type === 'pendulum') {
      return `${this.baseImage}/card-${this.data.pendulumType}.png`;
    } else {
      return `${this.baseImage}/card-${this.data.type}.png`;
    }
  }

  get autoNameColor() {
    let color = 'black';
    // 自动颜色
    if ((this.data.type === 'monster' && ['xyz', 'link'].includes(this.data.cardType)) || ['spell', 'trap'].includes(this.data.type) ||
      (this.data.type === 'pendulum' && ['xyz-pendulum', 'link-pendulum'].includes(this.data.pendulumType))) {
      color = 'white';
    }
    return color;
  }

  get showAttribute() {
    if (['monster', 'pendulum'].includes(this.data.type)) {
      return !!this.data.attribute;
    }
    return true;
  }

  get attributeUrl() {
    let suffix = '';
    if (this.data.language === 'jp') {
      suffix = '-jp';
    } else if (this.data.language === 'kr') {
      suffix = '-kr';
    } else if (this.data.language === 'en') {
      suffix = '-en';
    } else if (this.data.language === 'astral') {
      suffix = '-astral';
    }
    if (['monster', 'pendulum'].includes(this.data.type)) {
      if (!this.data.attribute) {
        return '';
      }
      return `${this.baseImage}/attribute-${this.data.attribute}${suffix}.png`;
    } else {
      return `${this.baseImage}/attribute-${this.data.type}${suffix}.png`;
    }
  }

  get spellTrapName() {
    let name = '';
    // 简中与繁中在此处用字相同，合并处理
    if (['sc', 'tc'].includes(this.data.language)) {
      if (this.data.type === 'spell') {
        name = '魔法卡';
      } else if (this.data.type === 'trap') {
        name = '陷阱卡';
      }
    } else if (this.data.language === 'jp') {
      if (this.data.type === 'spell') {
        name = '[魔(ま)][法(ほう)]カード';
      } else if (this.data.type === 'trap') {
        name = '[罠(トラップ)]カード';
      }
    } else if (this.data.language === 'kr') {
      if (this.data.type === 'spell') {
        name = '마법 카드';
      } else if (this.data.type === 'trap') {
        name = '함정 카드';
      }
    } else if (this.data.language === 'en') {
      if (this.data.type === 'spell') {
        name = 'Spell Card';
      } else if (this.data.type === 'trap') {
        name = 'Trap Card';
      }
    } else if (this.data.language === 'astral') {
      if (this.data.type === 'spell') {
        name = 'マホウカアド';
      } else if (this.data.type === 'trap') {
        name = 'トラププカアド';
      }
    }
    return name;
  }

  get showAttributeRare() {
    return this.showAttribute && ['hr', 'ser', 'gser', 'pser'].includes(this.data.rare);
  }

  get showLevel() {
    let show = false;
    if (this.data.type === 'monster') {
      show = ['normal', 'effect', 'ritual', 'fusion', 'synchro', 'token'].includes(this.data.cardType);
    } else if (this.data.type === 'pendulum') {
      show = ['normal-pendulum', 'effect-pendulum', 'ritual-pendulum', 'fusion-pendulum', 'synchro-pendulum'].includes(this.data.pendulumType);
    }
    return show;
  }

  get showRank() {
    let show = false;
    if (this.data.type === 'monster') {
      show = this.data.cardType === 'xyz';
    } else if (this.data.type === 'pendulum') {
      show = this.data.pendulumType === 'xyz-pendulum';
    }
    return show;
  }

  get showEffect() {
    return ['monster', 'pendulum'].includes(this.data.type) && this.data.monsterType;
  }

  get showAtkDefLink() {
    // monster 的 link / 非 link 两种情况已经覆盖全部 monster，等价于「怪兽或灵摆」
    return !!this.data.atkBar && ['monster', 'pendulum'].includes(this.data.type);
  }

  get atkDefLinkUrl() {
    const suffix = this.data.language === 'astral' ? '-astral' : '';
    if (this.data.type === 'monster' && this.data.cardType === 'link') {
      return `${this.baseImage}/atk-link${suffix}.svg`;
    }
    if (['monster', 'pendulum'].includes(this.data.type)) {
      return `${this.baseImage}/atk-def${suffix}.svg`;
    }
    return '';
  }
}
