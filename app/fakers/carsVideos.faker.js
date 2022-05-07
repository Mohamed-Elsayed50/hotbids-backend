const faker = require('faker')
const {Car} = require('../models/Car')
const {CarVideo} = require('../models/CarVideo')

module.exports = async function () {
    const cars = await Car.find();
    const videos = [
        'https://www.youtube.com/embed/dRv89IVuJYY',
        'https://www.youtube.com/embed/1LmCuTb826I',
        'https://www.youtube.com/embed/rTvcLO9jAhc',
        'https://www.youtube.com/embed/SyMoZOrmaxU',
        'https://www.youtube.com/embed/N_8e3oyH-tc',
        'https://www.youtube.com/embed/jcc3_HMAN58',
        'https://www.youtube.com/embed/_tI2GEQTsgY',
        'https://www.youtube.com/embed/36crLJvSmEU',
        'https://www.youtube.com/embed/b0HWzgZFoMM',
        'https://www.youtube.com/embed/mE6iIkadSdM',
        'https://www.youtube.com/embed/KRfFyV2eeyU',
        'https://www.youtube.com/embed/0MIk7hugfsQ',
        'https://www.youtube.com/embed/xBQmeAxEN5w',
        'https://www.youtube.com/embed/AHPLZ4YTHMQ',
        'https://www.youtube.com/embed/7b9gJRCV_Aw',
        'https://player.vimeo.com/video/474847447',
    ];

    cars.forEach(car => {
        let count = faker.random.number({min: 0, max: 5});

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let carVideo = new CarVideo();
                carVideo.car = car;
                carVideo.url = faker.random.arrayElement(videos);
                carVideo.save();
            }
        }
    })
}
