const faker = require('faker')
const {Car} = require('../models/Car')
const {User} = require('../models/User')

module.exports = async function (count) {
    for (let i = 0; i < count; i++) {
        const car = new Car();

        car.owner = await User.createQueryBuilder("user").orderBy('RAND()').getOne();
        car.reserve = faker.random.boolean();
        car.title = faker.vehicle.vehicle();
        car.subtitle = faker.vehicle.manufacturer();
        car.endDate = faker.date.future();
        car.historyReport = faker.image.imageUrl();
        car.location = faker.address.city();
        car.vin = faker.vehicle.vin();
        car.mileage = faker.random.number();
        car.bodyStyle = faker.vehicle.type();
        car.engine = faker.vehicle.fuel();
        car.drivetrain = faker.lorem.words();
        car.transmission = faker.lorem.words();
        car.exteriorColor = faker.vehicle.color();
        car.interiorColor = faker.vehicle.color();
        car.titleStatus = faker.lorem.words();
        car.sellerType = faker.lorem.words();
        car.highlights = faker.lorem.paragraphs();
        car.equipment = faker.lorem.paragraphs();
        car.modifications = faker.lorem.paragraphs();
        car.knownFlaws = faker.lorem.paragraphs();
        car.recentServiceHistory = faker.lorem.paragraphs();
        car.otherItemsIncludedInSale = faker.lorem.paragraphs();
        car.sellersOwnershipHistory = faker.lorem.paragraphs();
        car.sellerNotes = faker.lorem.paragraphs();

        await car.save();
    }
}
