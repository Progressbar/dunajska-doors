const { open, openTime } = require('./phone-commands');

console.log(`expected time: ${openTime}ms`);
const now = Date.now();
console.log('starting to open');
open()
  .then(() => {
    const delta = Date.now() - now; 
    console.log('script finished');
    console.log(`actual time: ${delta}ms`);
  });
