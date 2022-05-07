const {User} = require('../models/User')

module.exports = (req, res, next) => {
    if (!User.hasAuthenticatedUser(req)) {
        res.status(401).send('unauthorized')
        return
    }
    next()
}
