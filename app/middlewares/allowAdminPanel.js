const {User} = require('../models/User')

module.exports = (req, res, next) => {
    if (!User.getAuthenticatedUser(req).allowAdminPanel) {
        res.status(401).send('access denied')
        return
    }

    next()
}
