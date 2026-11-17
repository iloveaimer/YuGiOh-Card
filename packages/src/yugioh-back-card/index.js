import { Image } from 'leafer-unified';
import { Card } from '../card/index.js';

export class YugiohBackCard extends Card {
  cardLeaf = null;
  konamiLeaf = null;
  registerLeaf = null;
  logoLeaf = null;
  cardWidth = 1394;
  cardHeight = 2031;

  data = {
    type: 'normal',
    logo: 'ocg',
    konami: true,
    register: true,
    radius: true,
    scale: 1,
  };

  constructor(data = {}) {
    super(data);

    this.initLeafer();
    this.setData(data.data);
  }

  get tag() {
    return 'YugiohBackCard';
  }

  draw() {
    this.runDrawSteps(['drawCard', 'drawKonami', 'drawRegister', 'drawLogo', 'updateScale']);
  }

  drawKonami() {
    this.leaf('konamiLeaf', Image).set({
      url: `${this.baseImage}/konami.png`,
      x: 94,
      y: 95,
      visible: this.data.konami,
      zIndex: 10,
    });
  }

  drawRegister() {
    this.leaf('registerLeaf', Image).set({
      url: `${this.baseImage}/register.png`,
      x: 370,
      y: 114,
      visible: this.data.register,
      zIndex: 10,
    });
  }

  drawLogo() {
    const logoUrl = this.data.logo ? `${this.baseImage}/logo-${this.data.logo}.png` : '';
    let x, y;
    if (this.data.logo === 'ocg') {
      x = 878;
      y = 1722;
    } else if (this.data.logo === 'tcg') {
      x = 859;
      y = 1763;
    } else if (this.data.logo === 'rd') {
      x = 864;
      y = 1763;
    }
    this.leaf('logoLeaf', Image).set({
      url: logoUrl,
      x,
      y,
      visible: this.data.logo,
      zIndex: 10,
    });
  }

  get baseImage() {
    return `${this.resourcePath}/yugioh-back/image`;
  }

  get cardUrl() {
    return `${this.baseImage}/card-${this.data.type}.png`;
  }
}
