# SETUP

## required
Install a recent node (9+) and npm (5+)

```bash
$ cp env.sample.js env.js
$ npm i
```

## optional
Modify the `env.js` file to your liking

# RUN
```bash
$ node web-server
```

# UTILS
If you want to test the phone inputs, log into the RPI (or whichever device is attached to the phone), and run `node phone-command-stats`. This will display some information. You can tweak the commands through the DSL in `phone-commands.js` stored in the sequence variables.

To test if your device is supporting GPIOs in its current configuration, run `require('./can-use-gpios')` within node:

```bash
pi@some.pi:dunajska-doors$ node
> require('./can-use-gpios')
true
```

# NOTES
By default, you can reach the server at `http://localhost:8080`, but you can change the port in the env file

