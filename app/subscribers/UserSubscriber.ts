import { User } from "../models/User";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { StatisticTypes, Statistic } from "../models/Statistic";
import * as UserManagerWsOptions from '../dictionaries/userManager/ws'
import SocketController from '../controllers/SocketController'
import { TwillioTokenService } from '../utils/TwillioTokenService';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async afterInsert(event: InsertEvent<User>) {
        if (event.entity.id && event.entity.username) {
            SocketController.managers.sendToRoom(
                UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                UserManagerWsOptions.wsEvents.USER_MANAGER_ADD_USER, 
                { user: event.entity }
            )
            
            try {
                await Statistic.add(StatisticTypes.NEW_USER, 1, true)
            } catch (error) {
                console.log(error);
            }
        }
    }

    async afterUpdate(event: UpdateEvent<User>) {
        if (event.updatedColumns.length > 0) {
            SocketController.managers.sendToRoom(
                UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER, 
                { user: event.entity }
            )
        }

        if (event.updatedColumns.some(c => c.propertyName === 'verified') && event.entity.verified) {
            try {
                await TwillioTokenService.createChannel([event.entity])
            } catch (error) {
                console.log(error)
            }
        }
    }
}
