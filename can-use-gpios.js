const { Gpio } = require('onoff');

let canUse = true;

try {
  // eslint-disable-next-line no-new
  new Gpio();
} catch (e) {
  canUse = false;
}

module.exports = canUse;
