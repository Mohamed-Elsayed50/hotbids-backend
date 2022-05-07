"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarSubscriber = void 0;
const Car_1 = require("../models/Car");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
const UserNotificationHistory_1 = require("../models/UserNotificationHistory");
const Statistic_1 = require("../models/Statistic");
const SocketController_1 = __importDefault(require("../controllers/SocketController"));
const CarManagerOptions = __importStar(require("../dictionaries/carManager/ws"));
const UserManagerOptions = __importStar(require("../dictionaries/userManager/ws"));
const CarController_1 = __importDefault(require("../controllers/CarController"));
let CarSubscriber = class CarSubscriber {
    listenTo() {
        return Car_1.Car;
    }
    afterInsert(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.entity.verified && event.entity.verificationState == Car_1.Car.VERIFICATION_STATE.APPLICATION) {
                const res = yield Promise.allSettled([
                    UserNotificationHistory_1.UserNotificationHistory.sendNewCarPendindApproval(event.entity),
                    Statistic_1.Statistic.add(Statistic_1.StatisticTypes.PENDING_APPROVAL, 1, true)
                ]);
                console.log(res);
            }
        });
    }
    afterUpdate(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.updatedColumns.some(c => CarController_1.default.carCreateParams.includes(c.propertyName))) {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const carQuery = Car_1.Car.getQueryFullCar();
                    carQuery.where('car.id = :id', { id: event.entity.id });
                    const car = yield carQuery.getOne();
                    try {
                        SocketController_1.default.managers.sendToRoom(CarManagerOptions.wsRooms.ROOM_CAR_MANAGER, CarManagerOptions.wsEvents.CAR_MANAGER_UPDATE_CAR, { car });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }), 1000);
            }
            if (event.updatedColumns.some(c => c.propertyName === 'verificationState')) {
                SocketController_1.default.managers.sendToRoom(CarManagerOptions.wsRooms.ROOM_CAR_MANAGER, CarManagerOptions.wsEvents.CAR_MANAGER_UPDATE_CAR, { car: event.entity });
            }
            if (event.updatedColumns.some(c => c.propertyName === 'verified')) {
                const carQuery = Car_1.Car.getQueryFullCar();
                carQuery.where('car.id = :id', { id: event.entity.id });
                const car = yield carQuery.getOne();
                if (car) {
                    SocketController_1.default.onNewAuctionAdded(car);
                }
                const userQuery = User_1.User.getUserManagerQuery('DESC');
                userQuery.where('user.id = :id', { id: event.entity.ownerId });
                const user = yield userQuery.getRawOne();
                if (user) {
                    SocketController_1.default.managers.sendToRoom(UserManagerOptions.wsRooms.ROOM_USER_MANAGER, UserManagerOptions.wsEvents.USER_MANAGER_NEW_USER_CAR, { car: user });
                }
            }
        });
    }
};
CarSubscriber = __decorate([
    typeorm_1.EventSubscriber()
], CarSubscriber);
exports.CarSubscriber = CarSubscriber;
//# sourceMappingURL=CarSubscriber.js.map