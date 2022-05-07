import { Car } from "../models/Car";
import { User } from "../models/User";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";
import { UserNotificationHistory } from "../models/UserNotificationHistory";
import { StatisticTypes, Statistic } from "../models/Statistic";
import SocketController from "../controllers/SocketController";
import * as CarManagerOptions from '../dictionaries/carManager/ws'
import * as UserManagerOptions from '../dictionaries/userManager/ws'
import CarController from '../controllers/CarController'

@EventSubscriber()
export class CarSubscriber implements EntitySubscriberInterface {
    listenTo() {
        return Car;
    }

    async afterInsert(event: InsertEvent<Car>) {
        if (!event.entity.verified && event.entity.verificationState == Car.VERIFICATION_STATE.APPLICATION) {
            const res = await Promise.allSettled([
                UserNotificationHistory.sendNewCarPendindApproval(event.entity),
                Statistic.add(StatisticTypes.PENDING_APPROVAL, 1, true)
            ])

            console.log(res)
        }
    }

    async afterUpdate(event: UpdateEvent<Car>) {
        if (event.updatedColumns.some(c => CarController.carCreateParams.includes(c.propertyName))) {
            setTimeout(async () => {
                const carQuery = Car.getQueryFullCar()
                carQuery.where('car.id = :id', { id: event.entity.id })
                const car = await carQuery.getOne()

                try {
                    SocketController.managers.sendToRoom(
                        CarManagerOptions.wsRooms.ROOM_CAR_MANAGER, 
                        CarManagerOptions.wsEvents.CAR_MANAGER_UPDATE_CAR,
                        { car }
                    )
                } catch (error) {
                    console.log(error)
                }
            }, 1000)
        }

        if (event.updatedColumns.some(c => c.propertyName === 'verificationState')) {
            SocketController.managers.sendToRoom(
                CarManagerOptions.wsRooms.ROOM_CAR_MANAGER, 
                CarManagerOptions.wsEvents.CAR_MANAGER_UPDATE_CAR,
                { car: event.entity }
            )
        }

        if (event.updatedColumns.some(c => c.propertyName === 'verified')) {
            const carQuery = Car.getQueryFullCar()
            carQuery.where('car.id = :id', { id: event.entity.id })
            const car = await carQuery.getOne()
            if (car) {
                SocketController.onNewAuctionAdded(car)
            }

            const userQuery = User.getUserManagerQuery('DESC')
            userQuery.where('user.id = :id', { id: event.entity.ownerId })
            const user = await userQuery.getRawOne()
            
            if (user) {
                SocketController.managers.sendToRoom(
                    UserManagerOptions.wsRooms.ROOM_USER_MANAGER,
                    UserManagerOptions.wsEvents.USER_MANAGER_NEW_USER_CAR,
                    { car: user }
                )
            }
        }
    }
}
