### Requirements

Install libraries for chromium:

`sudo yum install alsa-lib.x86_64 atk.x86_64 cups-libs.x86_64 gtk3.x86_64 ipa-gothic-fonts libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXrandr.x86_64 libXScrnSaver.x86_64 libXtst.x86_64 pango.x86_64 xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1 xorg-x11-utils`

### Installation

1. Install the npm package:

    `npm install` or `yarn install`

2. Set up environment variables following the example in .env.example

### Documentation 

You can find all api method [here](https://app.swaggerhub.com/apis/Kassius/bids/1.0.0#/)

### How to start

To sync your db (mysql) set `"synchronize": true` in `ormcomfing.js` - Typeorm will create tables

* `npm run dev` - start and watch files changes

* `npm run build && npm run start` - build and start
