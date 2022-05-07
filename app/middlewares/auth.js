const {User} = require('../models/User')

module.exports = async (req, res, next) => {
    if (!req.headers.authorization) {
        next()
        return;
    }

    const user = await User.createQueryBuilder("user")
        .leftJoinAndSelect("user.userAccessTokens", "tokens")
        .leftJoinAndSelect("user.userNotification", "notifications")
        .where("tokens.token = :token", {token: req.headers.authorization})
        .getOne();

    if (user)
        User.setAuthenticatedUser(req, user);

    next()
}
