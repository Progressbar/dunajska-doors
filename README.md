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

# copyable commands to set up the pi
After raspbian is succesfully installed with ssh and networking, running the following commands should set everything up properly. They haven't been fully tested, so you might expect some issues, but nothing too hard to fix

```
# Download node/npm
cd Downloads
wget -O node.tar.xz https://nodejs.org/dist/v10.8.0/node-v10.8.0-linux-armv6l.tar.xz

# install
tar xf node.tar.xz
cd node.tar.xz
sudo cp -R * /usr/local/

# setup proper npm permissions
cd
mkdir .npm-global
npm config set prefix '~/.npm-global'
# adds local node_module executables, another easy to reach directory for executables, and global npm executables
echo "PATH=./node_modules/.bin:/home/pi/.bin:/home/pi/.npm-global/bin:\$PATH" >> .bashrc
source .bashrc

# add pm2
npm i -g pm2

# setup git structure
mkdir git/github/Progressbar
cd git/github/Progressbar

git clone https://github.com/Progressbar/dunajska-doors
cd dunajska-doors
cp env.sample.js env.js
npm i
## you might want to edit env.js and add your user.db here

git clone https://github.com/Progressbar/telegram-bot
cd ../telegram-bot
cp env.sample.js env.js
npm i
## you might want to edit env.js and add your store.db here

# make it run again on restart
cd
echo "require('./git/github/Progressbar/dunajska-doors/web-server');" > start.js
echo "require('./git/github/Progressbar/telegram-bot');" >> start.js
sudo echo "$(which pm2) start /home/pi/start.js"

# now start it yourself
pm2 start start.js
```
