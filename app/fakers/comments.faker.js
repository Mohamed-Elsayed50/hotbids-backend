const faker = require('faker')
const {User} = require('../models/User')
const {Car} = require('../models/Car')
const {Comment} = require('../models/Comment')

module.exports = async (minComments = 0, maxComments = 10) => {
    const cars = await Car.find();

    for (const car of cars) {
        let count = faker.random.number({min: minComments, max: maxComments});

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let comment = new Comment();

                comment.car = car;
                comment.user = await User.createQueryBuilder("user").orderBy('RAND()').getOne();
                comment.seller = car.ownerId === comment.user.id;
                comment.comment = faker.lorem.paragraphs();
                comment.likes = 0;
                comment.inappropriate = 0;
                comment.isBid = false;
                comment.createdAt = faker.date.past();
                if (faker.random.boolean())
                    comment.replyToComment = await Comment.createQueryBuilder("comment")
                        .where("comment.car_id = :car_id", {car_id: car.id})
                        .orderBy('RAND()')
                        .getOne();

                await comment.save();
            }
        }
    }
}
