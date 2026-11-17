import { Group, Image, Rect, Text } from 'leafer-unified';
import { Card } from '../card/index.js';
import { CompressText } from '../compress-text/index.js';
import { collectFontFamilies } from '../utils/index.js';
import scStyle from './style/sc-style.js';
import jpStyle from './style/jp-style.js';

export class RushDuelCard extends Card {
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
  maximumAtkLeaf = null;
  atkDefLeaf = null;
  legendLeaf = null;
  laserLeaf = null;
  rareLeaf = null;
  cardWidth = 1394;
  cardHeight = 2031;

  data = {
    language: 'sc',
    name: '',
    color: '',
    type: 'monster',
    attribute: 'dark',
    icon: '',
    image: '',
    cardType: 'normal',
    level: 0,
    monsterType: '',
    maximumAtk: 0,
    atk: 0,
    def: 0,
    description: '',
    firstLineCompress: false,
    descriptionAlign: false,
    descriptionZoom: 1,
    descriptionWeight: 0,
    package: '',
    password: '',
    legend: false,
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
    return 'RushDuelCard';
  }

  draw() {
    this.runDrawSteps([
      'drawCard', 'drawName', 'drawAttribute', 'drawLevel',
      'drawSpellTrap', 'drawImage', 'drawMask', 'drawPackage',
      'drawEffect', 'drawDescription', 'drawMaximumAtk', 'drawAtkDef',
      'drawLegend', 'drawLaser', 'drawRare', 'updateScale',
    ]);
  }

  drawName() {
    const { name } = this.style;

    this.leaf('nameLeaf', CompressText).set({
      text: this.data.name,
      fontFamily: name.fontFamily,
      fontSize: name.fontSize,
      letterSpacing: name.letterSpacing || 0,
      color: this.data.color || 'black',
      rtFontSize: name.rtFontSize,
      rtTop: name.rtTop,
      width: this.showAttribute ? 1025 : 1248,
      height: 200,
      x: 71,
      y: name.top,
      zIndex: 10,
    });
  }

  drawAttribute() {
    this.leaf('attributeLeaf', Image).set({
      url: this.attributeUrl,
      x: 1138,
      y: 68,
      visible: this.showAttribute,
      zIndex: 30,
    });
  }

  drawLevel() {
    const levelLeaf = this.leaf('levelLeaf', Group, group => {
      group.add(new Image());
      group.add(new Text());
    });

    const levelImage = levelLeaf.children[0];
    const levelText = levelLeaf.children[1];

    const levelUrl = `${this.baseImage}/level.png`;
    levelImage.set({
      url: levelUrl,
      x: 80,
      y: 1216,
    });

    levelText.set({
      text: this.data.level,
      fontFamily: 'rd-atk-def',
      fontSize: 116,
      fill: 'white',
      stroke: '#D3100D',
      strokeWidth: 10,
      x: 191,
      y: 1291,
      around: { type: 'percent', x: 0.5, y: 0 },
    });

    levelLeaf.set({
      visible: this.data.type === 'monster',
      zIndex: 40,
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
    const iconWidth = this.data.icon ? 60 : 0;
    const leftBracket = '【';
    const rightBracket = '】';
    const letterSpacing = spellTrap.letterSpacing || 0;

    const leftText = spellTrapLeaf.children[0];
    const spellTrapIcon = spellTrapLeaf.children[1];
    const rightText = spellTrapLeaf.children[2];

    leftText.set({
      text: leftBracket + this.spellTrapName,
      fontFamily: spellTrap.fontFamily,
      fontSize: spellTrap.fontSize,
      fontWeight: spellTrap.fontWeight,
      letterSpacing,
      rtFontSize: spellTrap.rtFontSize,
      rtTop: spellTrap.rtTop,
      x: 99,
      y: spellTrap.top,
    });
    const leftBounds = leftText.bounds;

    spellTrapIcon.set({
      url: iconUrl,
      x: leftText.x + (this.data.icon ? (icon.marginLeft || 0) : 0) + leftBounds.width,
      y: spellTrap.top + (icon.marginTop || 0),
    });

    rightText.set({
      text: rightBracket,
      fontFamily: spellTrap.fontFamily,
      fontSize: spellTrap.fontSize,
      fontWeight: spellTrap.fontWeight,
      letterSpacing,
      x: spellTrapIcon.x + (this.data.icon ? (icon.marginRight || 0) : 0) + iconWidth,
      y: spellTrap.top,
    });

    spellTrapLeaf.set({
      visible: ['spell', 'trap'].includes(this.data.type),
      zIndex: 10,
    });
  }

  drawImage() {
    super.drawImage({ width: 1254, height: 1258, x: 70, y: 200, visible: this.data.image });
  }

  drawMask() {
    this.leaf('maskLeaf', Image).set({
      url: this.maskUrl,
      x: 70,
      y: 197,
      zIndex: 20,
    });
  }

  drawPackage() {
    const packageLeaf = this.leaf('packageLeaf', CompressText);
    packageLeaf.set({
      text: this.data.package,
      fontFamily: 'rd-tip',
      fontSize: 33,
      color: 'white',
      textAlign: 'right',
      scaleX: 0.9,
      y: 1914,
      zIndex: 30,
    });
    const bounds = packageLeaf.bounds;
    packageLeaf.x = this.cardWidth - 130 - bounds.width;
  }

  drawEffect() {
    const { effect } = this.style;

    const leftBracket = '【';
    const rightBracket = '】';

    this.leaf('effectLeaf', CompressText).set({
      text: leftBracket + this.data.monsterType + rightBracket,
      fontFamily: effect.fontFamily,
      fontSize: effect.fontSize,
      fontWeight: effect.fontWeight,
      strokeWidth: this.data.descriptionWeight,
      letterSpacing: effect.letterSpacing || 0,
      rtFontSize: effect.rtFontSize,
      rtStrokeWidth: this.data.descriptionWeight,
      rtTop: effect.rtTop,
      width: 1000,
      height: 80,
      x: 99 + (effect.textIndent || 0),
      y: effect.top,
      visible: this.data.type === 'monster' && this.data.monsterType,
      zIndex: 30,
    });
  }

  drawDescription() {
    const { description } = this.style;

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
      width: 1196,
      height: 350,
      x: 99,
      y: description.top,
      zIndex: 30,
    });
  }

  drawMaximumAtk() {
    const maximumAtkLeaf = this.leaf('maximumAtkLeaf', Group, group => {
      group.add(new Image());
      group.add(new Text());
    });

    const maximumAtkImage = maximumAtkLeaf.children[0];
    const maximumAtkText = maximumAtkLeaf.children[1];

    const maximumAtkUrl = `${this.baseImage}/maximum-atk.png`;
    maximumAtkImage.set({
      url: maximumAtkUrl,
      x: 191,
      y: 1253,
    });

    maximumAtkText.set({
      text: this.data.maximumAtk,
      fontFamily: 'rd-atk-def',
      fontSize: 97,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 3,
      letterSpacing: -6,
      x: this.cardWidth - 229,
      y: 1247,
      around: { type: 'percent', x: 1, y: 0 },
    });

    maximumAtkLeaf.set({
      visible: this.data.type === 'monster' && this.data.maximumAtk,
      zIndex: 30,
    });
  }

  drawAtkDef() {
    const atkDefLeaf = this.leaf('atkDefLeaf', Group, group => {
      group.add(new Image());
      group.add(new Text());
      group.add(new Text());
    });

    const atkDefImage = atkDefLeaf.children[0];
    const atkText = atkDefLeaf.children[1];
    const defText = atkDefLeaf.children[2];

    const atkDefUrl = `${this.baseImage}/atk-def.png`;
    atkDefImage.set({
      url: atkDefUrl,
      x: 186,
      y: 1355,
    });

    atkText.set({
      text: this.data.atk >= 0 ? this.data.atk : '?',
      fontFamily: 'rd-atk-def',
      fontSize: 97,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 3,
      letterSpacing: -6,
      x: this.cardWidth - 656,
      y: 1349,
      around: { type: 'percent', x: 1, y: 0 },
    });

    defText.set({
      text: this.data.def >= 0 ? this.data.def : '?',
      fontFamily: 'rd-atk-def',
      fontSize: 97,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 3,
      letterSpacing: -6,
      x: this.cardWidth - 229,
      y: 1349,
      around: { type: 'percent', x: 1, y: 0 },
    });

    atkDefLeaf.set({
      visible: this.data.type === 'monster',
      zIndex: 30,
    });
  }

  drawLegend() {
    const legendUrl = this.data.legend ? `${this.baseImage}/legend.png` : '';
    this.leaf('legendLeaf', Image).set({
      url: legendUrl,
      x: 84,
      y: 210,
      visible: this.data.legend,
      zIndex: 30,
    });
  }

  drawLaser() {
    const laserUrl = this.laserUrl;
    this.leaf('laserLeaf', Image).set({
      url: laserUrl,
      x: 1276,
      y: 1913,
      visible: this.data.laser,
      zIndex: 120,
    });
  }

  drawRare() {
    const rareUrl = this.data.rare ? `${this.baseImage}/rare-${this.data.rare}.png` : '';
    this.leaf('rareLeaf', Image).set({
      url: rareUrl,
      cornerRadius: this.data.radius ? 24 : 0,
      visible: this.data.rare,
      zIndex: 100,
    });
  }

  get baseImage() {
    return `${this.resourcePath}/rush-duel/image`;
  }

  get style() {
    let style = {};
    if (this.data.language === 'sc') {
      style = scStyle;
    } else if (this.data.language === 'jp') {
      style = jpStyle;
    }
    return style;
  }

  // 本次渲染需要的字体族：样式树 + 代码中直接引用的字体（攻守/星级用 rd-atk-def，辅助文本用 rd-tip）
  get fontFamilies() {
    return [...new Set([...collectFontFamilies(this.style), 'rd-atk-def', 'rd-tip'])];
  }

  get cardUrl() {
    if (this.data.type === 'monster') {
      return `${this.baseImage}/card-${this.data.cardType}.png`;
    } else {
      return `${this.baseImage}/card-${this.data.type}.png`;
    }
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
    if (this.data.language === 'sc') {
      if (this.data.type === 'spell') {
        name = '魔法卡';
      } else if (this.data.type === 'trap') {
        name = '陷阱卡';
      }
      if (this.data.icon === 'equip') {
        name += '/装备';
      } else if (this.data.icon === 'field') {
        name += '/场地';
      } else if (this.data.icon === 'quick-play') {
        name += '/速攻';
      } else if (this.data.icon === 'ritual') {
        name += '/仪式';
      } else if (this.data.icon === 'continuous') {
        name += '/永续';
      } else if (this.data.icon === 'counter') {
        name += '/反击';
      }
    } else if (this.data.language === 'jp') {
      if (this.data.type === 'spell') {
        name = '[魔(ま)][法(ほう)]カード';
      } else if (this.data.type === 'trap') {
        name = '[罠(トラップ)]カード';
      }
      if (this.data.icon === 'equip') {
        name += '／[装(そう)][備(び)]';
      } else if (this.data.icon === 'field') {
        name += '／フィールド';
      } else if (this.data.icon === 'quick-play') {
        name += '／[速(そっ)][攻(こう)]';
      } else if (this.data.icon === 'ritual') {
        name += '／[儀(ぎ)][式(しき)]';
      } else if (this.data.icon === 'continuous') {
        name += '／[永(えい)][続(ぞく)]';
      } else if (this.data.icon === 'counter') {
        name += '／カウンター';
      }
    }
    return name;
  }

  get maskUrl() {
    if (this.data.type === 'monster') {
      return `${this.baseImage}/card-mask-${this.data.cardType}.png`;
    } else {
      return `${this.baseImage}/card-mask-${this.data.type}.png`;
    }
  }
}
