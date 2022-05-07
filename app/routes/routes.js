const express = require('express')
const bodyParser = require('body-parser')

module.exports = function (app) {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));

    app.use(require('../middlewares/auth'))

    app.use('/question', require('./question.routes'))
    app.use('/comment', require('./comment.routes'))
    app.use('/user', require('./user.routes'))
    app.use('/cars', require('./car.routes'))
    app.use('/bid', require('./bid.routes'))
    app.use('/notification', require('./notification.routes'))
    app.use('/page', require('./page.routes'))
    app.use('/watched', require('./carWatched.routes'))
    app.use('/statistical', require('./statistical.routes'))
    app.use('/support', require('./support.routes'))
    app.use('/', (req, res) => res.status(200).send('!'))
}
