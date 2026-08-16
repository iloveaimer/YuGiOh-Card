import { inheritProp } from '../../utils/index.js';

export default inheritProp({
  fontFamily: 'ygo-en',
  name: {
    fontFamily: 'ygo-en-name',
    top: 92,
    fontSize: 96,
    letterSpacing: 0,
  },
  spellTrap: {
    fontFamily: 'ygo-en-race',
    top: 252,
    fontSize: 62,
    right: 142,
    letterSpacing: 0,
    icon: {
      marginTop: 10,
      marginLeft: 10,
    },
  },
  pendulumDescription: {
    top: 1284,
    fontSize: 34,
    letterSpacing: 0,
    lineHeight: 1.1,
  },
  effect: {
    fontFamily: 'ygo-en-race',
    top: 1526,
    fontSize: 40,
    letterSpacing: 0,
    lineHeight: 1.1,
  },
  description: {
    fontSize: 34,
    letterSpacing: 0,
    lineHeight: 1.1,
    smallFontSize: 28,
  },
});
