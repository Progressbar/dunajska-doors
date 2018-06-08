const { Gpio } = require('onoff');

const canUseGpio = require('./can-use-gpios');

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
      msDelta: +msDelta,
      pin: pinName,
      state: stateStringToValue(state),
    };
  });

const getTimeFromCommands = commands => commands.reduce((time, { msDelta }) => time + msDelta, 0);

// ms-delta pin-name state
// const openCommands = getCommandsFromSequence(`
//    0 end on
//  300 end off
//  200 zero on
// 2000 zero off
//  300 accept on
//  300 accept off
// 8000 zero on
//  300 zero off
//  200 zero on
//  300 zero off
// 5000 end on
//  300 end off
// `);

const openCommands = getCommandsFromSequence(`
 0 end on
 300 end off
 100 zero on
 1000 zero off
 300
 5000 end on
 300 end off
`)

/*
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
*/
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

const sharedExports = {
  openTime: getTimeFromCommands(openCommands),
  answerTime: getTimeFromCommands(answerCommands),
};

if (canUseGpio) {
  const relays = {
    accept: new Gpio(23, 'out'),
    end: new Gpio(24, 'out'),
    zero: new Gpio(25, 'out'),
  };

  const useCommands = commands => new Promise((resolve, reject) => {
    let time = 0;
    const timeouts = [];

    commands.forEach(({ msDelta, pin, state }, i) => {
      time += msDelta;

      const timeoutId = setTimeout(() => {
        try {
          relays[pin].writeSync(state);

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

  const open = () =>
    useCommands(openCommands);

  const answer = () =>
    useCommands(answerCommands);

  module.exports = {
    ...sharedExports,
    open,
    answer,
  };
} else {
  const noopPromise = () => Promise.resolve();

  module.exports = {
    ...sharedExports,
    open: noopPromise,
    answer: noopPromise,
  };
}
