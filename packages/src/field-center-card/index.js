import { Image, Rect } from 'leafer-unified';
import { Card } from '../card/index.js';

export class FieldCenterCard extends Card {
  cardLeaf = null;
  imageLeaf = null;
  maskLeaf = null;
  cardWidth = 1488;
  cardHeight = 2079;

  data = {
    image: '',
    radius: true,
    cardBack: false,
    scale: 1,
  };

  constructor(data = {}) {
    super(data);

    this.initLeafer();
    this.setData(data.data);
  }

  get tag() {
    return 'FieldCenterCard';
  }

  draw() {
    this.runDrawSteps(['drawCard', 'drawImage', 'drawMask', 'updateScale']);
  }

  drawCard() {
    this.leaf('cardLeaf', Image).set({
      url: this.cardUrl,
      cornerRadius: this.data.radius ? 24 : 0,
      zIndex: 0,
    });
  }

  drawImage() {
    this.leaf('imageLeaf', Rect, leaf => this.listenImageStatus(leaf)).set({
      width: 1308,
      height: 1907,
      x: 90,
      y: 85,
      fill: {
        type: 'image',
        url: this.data.image,
        mode: 'cover',
        align: 'top',
      },
      visible: this.data.image && !this.data.cardBack,
      zIndex: 10,
    });
  }

  drawMask() {
    this.leaf('maskLeaf', Image).set({
      url: `${this.baseImage}/card-mask.png`,
      cornerRadius: this.data.radius ? 24 : 0,
      visible: !this.data.cardBack,
      zIndex: 20,
    });
  }

  get baseImage() {
    return `${this.resourcePath}/field-center/image`;
  }

  get cardUrl() {
    if (this.data.cardBack) {
      return `${this.baseImage}/card-back.png`;
    } else {
      return `${this.baseImage}/card-background.png`;
    }
  }
}
