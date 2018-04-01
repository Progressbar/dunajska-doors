const { Gpio } = require('onoff');

const relays = {
  accept: new Gpio(23, 'out'),
  end: new Gpio(24, 'out'),
  zero: new Gpio(25, 'out'),
};

const [ON, OFF] = [1, 0];

const stateStringToValue = stateStr =>
  new Map([
    ['on', ON],
    ['off', OFF],
  ]).get(stateStr);

const getCommandsFromSequence = sequence => sequence
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)
  .map((line) => {
    const [msDelta, pinName, state] = line.split(' ');
    return {
      msDelta,
      pin: relays[pinName],
      state: stateStringToValue(state),
    };
  });

const useCommands = commands => new Promise((resolve, reject) => {
  let time = 0;
  const timeouts = [];

  commands.forEach(({ msDelta, pin, state }, i) => {
    time += msDelta;

    const timeoutId = setTimeout(() => {
      try {
        pin.writeSync(state);

        if (i === commands.length - 1) {
          resolve();
        }
      } catch (e) {
        timeouts.forEach(clearTimeout);
        reject();
      }
    }, time);

    timeouts.push(timeoutId);
  });
});

// ms-delta pin-name state
const openCommands = getCommandsFromSequence(`
   0 end on
 300 end off
 200 zero on
 200 zero off
 300 accept on
 300 accept off
8000 zero on
 300 zero off
 200 zero on
 300 zero off
5000 end on
 300 end off
`);

const answerCommands = getCommandsFromSequence(`
   0 accept on
 300 accept off
 400 zero on
 300 zero off
 200 zero on
 300 zero off
1000 end on
 300 end off
`);

const open = () =>
  useCommands(openCommands);

const answer = () =>
  useCommands(answerCommands);

module.exports = {
  open,
  answer,
};
