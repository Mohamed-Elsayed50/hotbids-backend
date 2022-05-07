const faker = require('faker')
const {User} = require('../models/User')
const {Car} = require('../models/Car')
const {Question} = require('../models/Question')

module.exports = async (minQuestions = 0, maxQuestions = 10) => {
    const cars = await Car.find();

    for (const car of cars) {
        let count = faker.random.number({min: minQuestions, max: maxQuestions});

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let question = new Question();

                question.car = car;
                question.user = await User.createQueryBuilder("user").orderBy('RAND()').getOne();
                question.question = faker.lorem.paragraphs();
                if (faker.random.boolean())
                    question.answer = faker.lorem.paragraphs();
                question.likes = 0;
                question.inappropriate = 0;
                question.createdAt = faker.date.past();

                await question.save();
            }
        }
    }
}
