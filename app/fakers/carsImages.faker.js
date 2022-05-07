const faker = require('faker')
const {Car} = require('../models/Car')
const {CarImage} = require('../models/CarImage')

module.exports = async function (minImages = 0, maxImages = 10) {
    const cars = await Car.find();
    const imagesTypes = [
        CarImage.TYPE_EXTERIOR,
        CarImage.TYPE_INTERIOR,
        CarImage.TYPE_MECHANICAL,
        CarImage.TYPE_DOCS,
        CarImage.TYPE_OTHER,
    ];
    for (const car of cars) {
        let count = faker.random.number({min: minImages, max: maxImages});

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let carImage = new CarImage();
                carImage.car = car;
                carImage.url = faker.image.imageUrl(640, 480, null, true);
                carImage.path = null;
                carImage.type = faker.random.arrayElement(imagesTypes);

                await carImage.save();
            }
        }
    }
}
