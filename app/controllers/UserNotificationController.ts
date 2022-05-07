import {Request, Response} from 'express';
import { UserNotification } from '../models/UserNotification';
import { User } from '../models/User';
import { UserNotificationHistory } from '../models/UserNotificationHistory';


class UserNotificationController {
    static async getNotifications(req: Request, res: Response) {
        let notifications, count, user = User.getAuthenticatedUser(req)

        if (!user) return

        try {
            notifications = await UserNotificationHistory.getUserNotifications(user)
        } catch (error) {
            console.log(error)
            res.status(400).send('bad request')
        }

        res.status(200).send(notifications)
    }

    static async markNotificationReaded(req: Request, res: Response) {
        try {
            await UserNotificationHistory.readNotification(req.params.notificationId)
        } catch (error) {
            res.status(404).send('user or notifications not found')
            return
        }

        res.status(200).send('notification readed')
    }

    static async TestDailyEmail(req: Request, res: Response) {
        try {
            await UserNotificationHistory.sendDailyNotification()
        } catch (error) {
            return res.status(400).send(error)
        }

        return res.status(200).send('Sended.')
    }
}

export default UserNotificationController;
