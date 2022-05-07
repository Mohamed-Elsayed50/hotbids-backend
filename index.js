require('dotenv').config();
const { Algolia } = require("./app/helpers/Algolia");
const { Stripe } = require("./app/helpers/Stripe");
const { Mail } = require("./app/helpers/Mail");
const { Files } = require("./app/helpers/Files");
const { LocationData } = require("./app/helpers/LocationData");
const cors = require('cors');
const express = require('express');
const { Statistic } = require('./app/models/Statistic');
const { TwillioTokenService } = require('./app/utils/TwillioTokenService');
const app = express();
const server = require('http').createServer(app);
const moment = require('moment')
const momentTz = require('moment-timezone')
const { createConnection } = require("typeorm")
const logger = require('./app/utils/Logger')

app.use(cors());

(async () => {
    momentTz.tz.setDefault('America/New_York')

    await createConnection()
    // LocationData.init()

    if (process.env.NODE_ENV === 'production') {
        await TwillioTokenService.init()
    }

    try {
        await Statistic.initVars()
        Memcache.init(process.env.MEMCACHED_SERVER)
    } catch (e) {
        console.log(e)
    }

    if (process.env.PRODUCTION) {
        Algolia.init(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_API_KEY)
        await Algolia.replaceAllCars()//need only to replace all data in algolia index
    }

    try {
        Stripe.init(process.env.STRIPE_SK)
        Mail.init(process.env.SENDGRID_API_KEY, process.env.SENDGRID_DEFAULT_SENDER)
        Files.init(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_DEFAULT_REGION, process.env.AWS_BUCKET)
    } catch (error) {

    }

    require('./app/routes/routes')(app)
    require('./app/sockets/sockets')(server)

    server.listen(process.env.PORT, () => {
        console.log(`App listening at http://localhost:${process.env.PORT}`)
        console.log(`Sockets is under http://localhost:${process.env.PORT}/sockets`)
        console.log(`If you need any fake data - use fakers from fakers directory and /faker route`)
    })
})()

