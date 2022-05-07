"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketStorage = void 0;
const Car_1 = require("../models/Car");
const CarImage_1 = require("../models/CarImage");
class SocketStorage {
    constructor(car, user, stripeIntentId, intervalId) {
        this.car = car;
        this.user = user;
        this.stripeIntentId = stripeIntentId;
        this.intervalId = intervalId;
    }
    getCarOrLoad(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.car ?
                this.car :
                yield Car_1.Car.createQueryBuilder('car')
                    .where('car.id = :id', { id: carId })
                    .leftJoinAndSelect('car.owner', 'owner')
                    .leftJoinAndSelect('car.bids', 'bids')
                    .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage_1.CarImage.TYPE_EXTERIOR}`)
                    .getOne();
        });
    }
}
exports.SocketStorage = SocketStorage;
//# sourceMappingURL=SocketStorage.js.map