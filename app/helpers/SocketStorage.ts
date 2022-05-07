import { User } from '../models/User';
import { Car } from '../models/Car';
import { CarImage } from '../models/CarImage';

export class SocketStorage {
    constructor(
        public car: Car,
        public user: User,
        public stripeIntentId: any,
        public intervalId: any
    ) {}

    async getCarOrLoad(carId) {
        return this.car ?
            this.car :
            await Car.createQueryBuilder('car')
            .where('car.id = :id', { id: carId })
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .getOne()
    }
}
