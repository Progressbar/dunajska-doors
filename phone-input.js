const { Gpio } = require('onoff');
const phoneInputPin = new Gpio(12, 'in', 'falling');

const listeners = [];
const blinkingDebounceMS = 1000;
let nextNoRingCheck = Date.now();

const prevInputs = [];
let lastIsPhoneBeingUsed = false;

const prevInputsStorageAmount = 10;

let prevInput = 1;
setInterval(() => {
  phoneInputPin.read((err, currentInput) => {
    const [prevInput, _] = prevInputs;
    prevInputs.unshift(currentInput);
    if(prevInputs.length > prevInputsStorageAmount) {
      prevInputs.pop();

      const isPhoneBeingUsed = prevInputs.filter(Boolean).length < prevInputsStorageAmount;

      if(isPhoneBeingUsed !== lastIsPhoneBeingUsed) {
        lastIsPhoneBeingUsed = isPhoneBeingUsed;
        listeners.filter(({ listener }) => {
          return listener(isPhoneBeingUsed);
        });
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
    const id = ++listenerIdIncrement;
    listeners.push({
      id,
      listener,
    });

    return id;
  },
  removeListener: (id) => {
    const index = listeners.findIndex(({ id: listenerId }) => id === listenerId);
    if(index > -1) {
      listeners.splice(index, 1); 
      return true;
    } 
    return false;
  }
}
