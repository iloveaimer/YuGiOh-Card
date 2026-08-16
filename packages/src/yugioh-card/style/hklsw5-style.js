import { inheritProp } from '../../utils/index.js';

// 华康隶书体 W5（繁体）- 对标 yugioh-card-maker 的 zh.ttf（華康隸書體W5）
export default inheritProp({
  fontFamily: 'ygo-hklsw5',
  name: {
    top: 91,
    fontSize: 108,
  },
  spellTrap: {
    top: 250,
    fontSize: 76,
    right: 138,
    icon: {
      marginTop: 12,
      marginLeft: 10,
    },
  },
  pendulumDescription: {
    top: 1280,
    fontSize: 36,
    lineHeight: 1.2,
  },
  effect: {
    top: 1525,
    fontSize: 44,
    lineHeight: 1.2,
    minHeight: 10,
  },
  description: {
    fontSize: 36,
    lineHeight: 1.2,
  },
});
