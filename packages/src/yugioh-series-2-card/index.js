import { Group, Image, Rect } from 'leafer-unified';
import { Card } from '../card/index.js';
import { CompressText } from '../compress-text/index.js';
import { collectFontFamilies, mergeFontStyle } from '../utils/index.js';
import jpStyle from './style/jp-style.js';
import custom1Style from './style/custom1-style.js';
import custom2Style from './style/custom2-style.js';
import lsStyle from '../yugioh-card/style/ls-style.js';
import lsfStyle from '../yugioh-card/style/lsf-style.js';
import hklsw7Style from '../yugioh-card/style/hklsw7-style.js';
import hklsw5Style from '../yugioh-card/style/hklsw5-style.js';
import ktStyle from '../yugioh-card/style/kt-style.js';
import fzlbStyle from '../yugioh-card/style/fzlb-style.js';
import hktfw5Style from '../yugioh-card/style/hktfw5-style.js';
import dfgls4Style from '../yugioh-card/style/dfgls4-style.js';
import dfgls5Style from '../yugioh-card/style/dfgls5-style.js';
import rodinStyle from '../yugioh-card/style/rodin-style.js';

// 系列2 自带的字体样式：坐标已按系列2 模板调好，直接使用
const NATIVE_STYLE_MAP = {
  custom1: custom1Style,
  custom2: custom2Style,
};

// 来自经典卡的字体样式：经典卡把坐标与字体混写在一起（两模板的 name.top 差 39px、
// effect.top 差 157px），因此只取其中的字体属性，坐标与字号仍用系列2 的基准（jpStyle）。
// 在模块加载时算好，避免每次取 style 都重建。键需与 UI 字体下拉选项保持一致。
const LEGACY_FONT_STYLE_MAP = Object.fromEntries(
  Object.entries({
    hklsw7: hklsw7Style,
    hklsw5: hklsw5Style,
    xlsj: lsStyle,
    xlsf: lsfStyle,
    kt: ktStyle,
    fzlb: fzlbStyle,
    hktfw5: hktfw5Style,
    dfgls4: dfgls4Style,
    dfgls5: dfgls5Style,
    rodin: rodinStyle,
  }).map(([font, style]) => [font, mergeFontStyle(jpStyle, style)]),
);

export class YugiohSeries2Card extends Card {
  cardLeaf = null;
  nameLeaf = null;
  attributeLeaf = null;
  levelLeaf = null;
  spellTrapLeaf = null;
  imageLeaf = null;
  maskLeaf = null;
  packageLeaf = null;
  effectLeaf = null;
  descriptionLeaf = null;
  atkDefLeaf = null;
  passwordLeaf = null;
  copyrightLeaf = null;
  laserLeaf = null;
  cardWidth = 1394;
  cardHeight = 2031;

  data = {
    language: 'jp',
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
    level: 0,
    monsterType: '',
    atk: 0,
    def: 0,
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
    radius: true,
    scale: 1,
  };

  constructor(data = {}) {
    super(data);

    this.initLeafer();
    this.setData(data.data);
  }

  get tag() {
    return 'YugiohSeries2Card';
  }

  draw() {
    this.runDrawSteps([
      'drawCard', 'drawName', 'drawAttribute', 'drawLevel',
      'drawSpellTrap', 'drawImage', 'drawMask', 'drawPackage',
      'drawEffect', 'drawDescription', 'drawAtkDef', 'drawPassword',
      'drawCopyright', 'drawLaser', 'updateScale',
    ]);
  }

  drawName() {
    const { name } = this.style;

    this.leaf('nameLeaf', CompressText).set({
      text: this.data.name,
      fontFamily: name.fontFamily,
      fontSize: name.fontSize,
      letterSpacing: name.letterSpacing || 0,
      textAlign: this.data.align || 'left',
      color: this.data.color || this.autoNameColor,
      gradient: this.data.gradient,
      gradientColor1: this.data.gradientColor1,
      gradientColor2: this.data.gradientColor2,
      rtFontSize: name.rtFontSize,
      rtTop: name.rtTop,
      rtColor: this.autoNameColor,
      width: this.showAttribute ? 953 : 1104,
      height: 200,
      x: 147,
      y: name.top,
      zIndex: 10,
    });
  }

  drawAttribute() {
    this.leaf('attributeLeaf', Image).set({
      url: this.attributeUrl,
      x: 1119,
      y: 128,
      visible: this.showAttribute,
      zIndex: 10,
    });
  }

  drawLevel() {
    const levelLeaf = this.leaf('levelLeaf', Group, group => {
      for (let i = 0; i < 12; i++) {
        group.add(new Image());
      }
    });

    const levelUrl = `${this.baseImage}/level.png`;
    const levelWidth = 92;
    const right = this.data.level < 12 ? 172 : 129;
    levelLeaf.children.forEach((level, index) => {
      level.set({
        url: levelUrl,
        x: this.cardWidth - right - index * (levelWidth + 3),
        y: 314,
        around: { type: 'percent', x: 1, y: 0 },
        visible: index < this.data.level,
      });
    });

    levelLeaf.set({
      visible: this.data.type === 'monster',
      zIndex: 10,
    });
  }

  drawSpellTrap() {
    this.leaf('spellTrapLeaf', Group, group => {
      group.add(new CompressText());
      group.add(new Image());
      group.add(new CompressText());
    });

    const { spellTrap } = this.style;
    const { icon } = spellTrap;

    const iconUrl = this.data.icon ? `${this.baseImage}/icon-${this.data.icon}.png` : '';
    const iconWidth = this.data.icon ? 72 : 0;
    const leftBracket = '【';
    const rightBracket = '】';
    const letterSpacing = spellTrap.letterSpacing || 0;

    const rightText = this.spellTrapLeaf.children[0];
    const spellTrapIcon = this.spellTrapLeaf.children[1];
    const leftText = this.spellTrapLeaf.children[2];

    rightText.set({
      text: rightBracket,
      fontFamily: spellTrap.fontFamily,
      fontSize: spellTrap.fontSize,
      letterSpacing,
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
      scaleY: spellTrap.scaleY || 1,
      rtFontSize: spellTrap.rtFontSize,
      rtTop: spellTrap.rtTop,
      rtFontScaleX: spellTrap.rtFontScaleX || 1,
      y: spellTrap.top,
    });
    const leftBounds = leftText.bounds;
    leftText.x = spellTrapIcon.x - (this.data.icon ? (icon.marginLeft || 0) : 0) - leftBounds.width;

    this.spellTrapLeaf.set({
      visible: ['spell', 'trap'].includes(this.data.type),
      zIndex: 10,
    });
  }

  drawImage() {
    super.drawImage({ width: 990, height: 1100, x: 202, y: 468, visible: this.data.image });
  }

  drawMask() {
    this.leaf('maskLeaf', Image).set({
      url: `${this.baseImage}/card-mask.png`,
      x: 143,
      y: 414,
      zIndex: 20,
    });
  }

  drawPackage() {
    const packageLeaf = this.leaf('packageLeaf', CompressText);
    packageLeaf.set({
      text: this.data.package,
      fontFamily: 'ygo-tip',
      fontSize: 33,
      y: 1601,
      zIndex: 30,
    });
    const bounds = packageLeaf.bounds;
    packageLeaf.x = this.cardWidth - 170 - bounds.width;
  }

  drawEffect() {
    const { effect } = this.style;

    const leftBracket = '【';
    const rightBracket = '】';

    this.leaf('effectLeaf', CompressText).set({
      text: leftBracket + this.data.monsterType + rightBracket,
      fontFamily: effect.fontFamily,
      fontSize: effect.fontSize,
      strokeWidth: this.data.descriptionWeight,
      lineHeight: effect.lineHeight,
      letterSpacing: effect.letterSpacing || 0,
      rtFontSize: effect.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: effect.rtTop,
      width: this.data.type === 'monster' ? 710 : 1095,
      height: 70,
      x: 149 + (effect.textIndent || 0),
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

    this.leaf('descriptionLeaf', CompressText).set({
      text: this.data.description,
      fontFamily: description.fontFamily,
      fontSize: description.fontSize,
      fontScale: this.data.descriptionZoom,
      textAlign: this.data.descriptionAlign ? 'center' : 'justify',
      firstLineCompress: this.data.firstLineCompress,
      strokeWidth: this.data.descriptionWeight,
      lineHeight: description.lineHeight,
      letterSpacing: description.letterSpacing || 0,
      rtFontSize: description.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: description.rtTop,
      width: this.data.type === 'monster' ? 710 : 1095,
      height: ['spell', 'trap'].includes(this.data.type) ? 240 : 170,
      x: 149,
      y: effect.top + effectHeight,
      zIndex: 30,
    });
  }

  drawAtkDef() {
    const atkDefLeaf = this.leaf('atkDefLeaf', Group, group => {
      group.add(new CompressText());
      group.add(new CompressText());
    });

    const atk = atkDefLeaf.children[0];
    const def = atkDefLeaf.children[1];

    let atkText = '';
    if (this.data.atk >= 0) {
      atkText = this.data.atk;
    } else if (this.data.atk === -1) {
      atkText = '????';
    } else if (this.data.atk === -2) {
      atkText = 'X000';
    }
    atk.set({
      text: this.atkName + atkText,
      fontFamily: 'ygo-jp',
      fontSize: 84,
      textAlign: 'justify',
      textJustifyLast: true,
      rtFontSize: 22,
      rtTop: -10,
      width: 288,
      x: 950,
      y: 1688,
    });

    let defText = '';
    if (this.data.def >= 0) {
      defText = this.data.def;
    } else if (this.data.def === -1) {
      defText = '????';
    } else if (this.data.def === -2) {
      defText = 'X000';
    }
    def.set({
      text: this.defName + defText,
      fontFamily: 'ygo-jp',
      fontSize: 84,
      textAlign: 'justify',
      textJustifyLast: true,
      rtFontSize: 22,
      rtTop: -10,
      width: 288,
      x: 950,
      y: 1795,
    });

    atkDefLeaf.set({
      visible: this.data.type === 'monster',
      zIndex: 30,
    });
  }

  drawPassword() {
    this.leaf('passwordLeaf', CompressText).set({
      text: this.data.password,
      fontFamily: 'ygo-tip',
      fontSize: 33,
      x: 66,
      y: 1940,
      zIndex: 30,
    });
  }

  drawCopyright() {
    const copyrightUrl = this.data.copyright ? `${this.baseImage}/copyright-${this.data.copyright}-black.svg` : '';
    this.leaf('copyrightLeaf', Image).set({
      url: copyrightUrl,
      x: this.cardWidth - 161,
      y: 1940,
      around: { type: 'percent', x: 1, y: 0 },
      visible: this.data.copyright,
      zIndex: 30,
    });
  }

  drawLaser() {
    const laserUrl = this.laserUrl;
    this.leaf('laserLeaf', Image).set({
      url: laserUrl,
      x: this.cardWidth - 118,
      y: this.cardHeight - 118,
      around: { type: 'percent', x: 1, y: 1 },
      visible: this.data.laser,
      zIndex: 120,
    });
  }

  get baseImage() {
    return `${this.resourcePath}/yugioh-series-2/image`;
  }

  // 本次渲染需要的字体族：样式树 + 代码中直接引用的字体（攻守用 ygo-jp，辅助文本用 ygo-tip）
  get fontFamilies() {
    return [...new Set([...collectFontFamilies(this.style), 'ygo-jp', 'ygo-tip'])];
  }

  get style() {
    // 系列2 模板只提供日文样式（jp-style）。字体未登记、或未选字体但语言不是日文时一律回退，
    // 否则返回空对象，drawName 等步骤读 style.name.fontFamily 会抛错，整张卡片只剩底图
    return NATIVE_STYLE_MAP[this.data.font] || LEGACY_FONT_STYLE_MAP[this.data.font] || jpStyle;
  }

  get cardUrl() {
    if (this.data.type === 'monster') {
      return `${this.baseImage}/card-${this.data.cardType}.png`;
    } else {
      return `${this.baseImage}/card-${this.data.type}.png`;
    }
  }

  get autoNameColor() {
    let color = 'black';
    // 自动颜色
    if (['spell', 'trap'].includes(this.data.type)) {
      color = 'white';
    }
    return color;
  }

  get showAttribute() {
    if (this.data.type === 'monster') {
      return !!this.data.attribute;
    }
    return true;
  }

  get attributeUrl() {
    let suffix = '';
    if (this.data.language === 'jp') {
      suffix = '-jp';
    }
    if (this.data.type === 'monster') {
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
    if (this.data.language === 'jp') {
      if (this.data.type === 'spell') {
        name = '[魔(ま)][法(ほう)]カード';
      } else if (this.data.type === 'trap') {
        name = '[罠(トラップ)]カード';
      }
    }
    return name;
  }

  get showEffect() {
    return this.data.type === 'monster' && this.data.monsterType;
  }

  get atkName() {
    let name = '';
    if (this.data.language === 'jp') {
      name = '[攻(こう)]';
    }
    return name;
  }

  get defName() {
    let name = '';
    if (this.data.language === 'jp') {
      name = '[守(しゅ)]';
    }
    return name;
  }
}
