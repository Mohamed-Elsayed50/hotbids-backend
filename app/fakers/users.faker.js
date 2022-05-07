const faker = require('faker')
const {User} = require('../models/User')

module.exports = async function (count) {
    for (let i = 0; i < count; i++) {
        const user = new User();
        user.email = faker.internet.email();
        user.username = faker.internet.userName();
        user.zip = faker.address.zipCode();
        user.phoneNumber = faker.phone.phoneNumber();
        user.verified = faker.random.boolean();
        user.reputation = Math.floor((10) * Math.random());
        await user.save();

    }
}
