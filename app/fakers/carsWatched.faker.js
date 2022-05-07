const faker = require('faker')
const {CarWatched} = require('../models/CarWatched')
const {Car} = require('../models/Car')
const {User} = require('../models/User')

module.exports = async function () {
    const cars = await Car.find();

    for (const car of cars) {
        let count = faker.random.number({min: 0, max: 30});

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let carWatched = new CarWatched();
                carWatched.car = car;
                carWatched.user = await User.createQueryBuilder("user").orderBy('RAND()').getOne();
                carWatched.createdAt = faker.date.past();
                carWatched.save().catch((err) => {
                    console.log(err.message);
                });
            }
        }
    }
}
