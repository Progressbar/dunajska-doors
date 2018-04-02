const { Gpio } = require('onoff');

const canUseGpio = require('./can-use-gpios');

if (canUseGpio) {
  const phoneInputPin = new Gpio(12, 'in', 'falling');

  const listeners = [];

  const prevInputs = [];
  let lastIsPhoneBeingUsed = false;

  const prevInputsStorageAmount = 10;

  setInterval(() => {
    phoneInputPin.read((err, currentInput) => {
      prevInputs.unshift(currentInput);
      if (prevInputs.length > prevInputsStorageAmount) {
        prevInputs.pop();

        const isPhoneBeingUsed = prevInputs.filter(Boolean).length < prevInputsStorageAmount;

        if (isPhoneBeingUsed !== lastIsPhoneBeingUsed) {
          lastIsPhoneBeingUsed = isPhoneBeingUsed;
          listeners.filter(({ listener }) => listener(isPhoneBeingUsed));
        }
      }
    });
  }, 100);

  let listenerIdIncrement = 0;
  module.exports = {
    get state() {
      return lastIsPhoneBeingUsed;
    },
    addListener: (listener) => {
      listenerIdIncrement += 1;
      const id = listenerIdIncrement;

      listeners.push({
        id,
        listener,
      });

      return id;
    },
    removeListener: (id) => {
      const index = listeners.findIndex(({ id: listenerId }) => id === listenerId);
      if (index > -1) {
        listeners.splice(index, 1);
        return true;
      }
      return false;
    },
  };
} else {
  const noop = () => {};

  module.exports = {
    state: false,
    addListener: noop,
    removeListener: noop,
  };
}
