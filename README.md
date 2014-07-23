# Node-Eyefi

This is my fork of the Eye-Fi node.js server. The original one either has some bugs or it just
refuses to run on my Raspberry Pi.

The use case for this version is to show the latest picture taken on a giant screen at our office.
Thus, facy stuff like geotagging will eventually be stripped away, once i get this damn thing to
work in the first place.

Currently, the app receives the same picture over and over again from an Eye-fi card, which probably 
just is due to my incompetence. I am not a programmer, and specifically i'm not a node.js programmer.
Any help is appreciated.

## Getting started

I do repeat that this software is still b0rken, so there is probably little reason why you would go
and install it. But just so i don't have to write the below instructions once the package actually
works, here goes.

Locate a computer running a Proprietary OS (Mac OSX, Windows). *Temporarily rename the computer* to
whatever your server is going to be called. Yeah, i know. It is silly. 

Insert your Eye-Fi card into  the previously mentioned computer. On the Eye-Fi card, there should be 
installer files for the card. Install the Eye-fi software. You'll also need to create an account at Eye-fi. 

Click the cog wheel icon by the Eye-Fi Card thingy on the left. This'll open up the card's options.
On the `Networks / Private networks` tab, add your wireless network information. On the `Direct
Mode` tab, uncheck Direct Mode network. On the `Public Hotspots` tab, remove Connect to Hotspots 
(because this disables Relayed Transfers). 

On the `Photos / Computer` tab, enable Upload all photos. On the `Online` tab, disable share
photos online. 

Save and close. 

Once you're that far, click the Eye-fi menu bar icon (close to the system clock) and write down the 
card's MAC address and upload code. You'll need it when configuring this app. 

Save and exit. Rename your computer back to its original name.

There may be an eye-fi configuration program for Linux. I don't know, but i wouldn't mind a more
*hackish* configuration tool than the pretty GUI


Now on your Linux box, clone this repository, run `npm install .`. 


```
    git clone git://github.com/llauren/node-eyefi.git
    npm install .
```

Note that your nodejs may be called just `node` on your box.

Edit the config.js file and fill in the card's MAC address (without the : separators) and upload code, 
and start the app with `nodejs app.js`.

Oh, and installing Node.js on a Raspberry Pi is also a bit of a hassle, but hey, you know how to
google. `aptitude install` will not help you, as the node.js there is outdated and npm is b0rken.

## Original text

To see more of the original README.md, go to the original repository.

## Todo

Fix the damn program so it actually works.

## Issues?

The software has only been tested with a Raspberry Pi running Raspbian and node.js 0.10.29/npm 1.4.14, 
and an Eye-FI PRO X2 Card. Your mileage will vary.

If you open an Issue, state as much information as possible such as: Eye-FI Firmware, Operating System, Node Version.

## Thanks

The documentation was probably taken from https://github.com/tachang/EyeFiServer and https://github.com/kristofg/rifec
