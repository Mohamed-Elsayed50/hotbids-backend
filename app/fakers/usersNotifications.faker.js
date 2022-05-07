const faker = require('faker')
const {User} = require('../models/User')
const {UserNotification} = require('../models/UserNotification')

module.exports = async function () {
    const users = await User.find({ relations: ["userNotification"] });
    users.forEach(user => {
        if (!user.userNotification) {
            let userNotification = new UserNotification();
            userNotification.user = user;

            userNotification.dailyEmail = faker.random.boolean();
            userNotification.mentionedInComments = faker.random.boolean();
            userNotification.repliesToMeInComments = faker.random.boolean();
            userNotification.playSoundWhenBidsArePlaced = faker.random.boolean();
            userNotification.hoursBeforeAuctionEnds = faker.random.boolean();
            userNotification.newBidsOnWatchedAuction = faker.random.boolean();
            userNotification.newCommentsOnWatchedAuction = faker.random.boolean();
            userNotification.questionsAnswered = faker.random.boolean();
            userNotification.auctionsResults = faker.random.boolean();
            userNotification.watchListNotificationsAlsoViaEmail = faker.random.boolean();
            userNotification.newCommentsViaEmail = faker.random.boolean();
            userNotification.newBidsViaEmail = faker.random.boolean();
            userNotification.save();
        }
    })
}
