import { Comment } from "../models/Comment";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { StatisticTypes, Statistic } from "../models/Statistic";
import SocketController from "../controllers/SocketController";
import * as UserManagerWsOptions from '../dictionaries/userManager/ws'
import { User } from "../models/User";

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
    listenTo() {
        return Comment;
    }

    async afterInsert(event: InsertEvent<Comment>) {
        if (event.entity.comment) {
            try {
                await Statistic.add(StatisticTypes.NEW_COMMENT, 1, true)
            } catch (error) {
                console.log(error);
            }

            try {
                const user = {
                    id: event.entity.userId,
                    last_comment: event.entity.comment
                }

                SocketController.managers.sendToRoom(
                    UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                    UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER,
                    { user }
                )
            } catch (error) {
                console.log(error)
            }

            try {
                const comment = event.entity
                SocketController.managers.sendToRoom(
                    UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                    UserManagerWsOptions.wsEvents.COMMENT_ADD,
                    { comment }
                )
            } catch (error) {
                console.log('afterInsertComment', error)
            }
        }
    }

    async afterUpdate(event: UpdateEvent<Comment>) {
        if (event.updatedColumns.some(c => c.propertyName === 'comment')) {
            const user = {
                id: event.entity.userId,
                last_comment: event.entity.comment
            }

            try {
                SocketController.managers.sendToRoom(
                    UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                    UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER,
                    { user }
                )
            } catch (error) {
                console.log(error)
            }
        }

        if (event.updatedColumns.some(c => c.propertyName === 'inappropriate' || c.propertyName === 'likes')) {
            try {
                const comment = event.entity
                SocketController.managers.sendToRoom(
                    UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, 
                    UserManagerWsOptions.wsEvents.COMMENT_UPDATE,
                    { comment }
                )
            } catch (error) {
                console.log('afterUpdateComment', error)
            }
        }
    }
}
