import { User } from "../models/User";
import { NotificationTypes, UserNotificationHistory } from "../models/UserNotificationHistory";
import { TwillioTokenService } from "../utils/TwillioTokenService";
import { createNewMessageInSupportNotificationContent } from "../dictionaries/notification/SupportNotification";
import { GetNewSupportMessageEmailTemplate } from '../helpers/GetEmailTemlate'
import { Mail } from '../helpers/Mail'
import { Request, Response } from 'express'
import Logger from "../utils/Logger";
import { getTextFromHtmlString, normalizeText } from "../utils/emailParser";

class SupportController {
    static async getToken(req: Request, res: Response) {
        if (!req.body.identity) {
            return res.status(400).send('bad request')
        }

        const identity = req.body.identity;

        const token = TwillioTokenService.generate(identity)

        res.status(200).send({
            identity: identity,
            token: token.toJwt(),
        })
    }

    static async onMessageAdded(req: Request, res: Response) {
        if (!req.body) return res.status(400).send('bad request')

        if (req.body['EventType'] === 'onMessageSent') {
            const hasChannel = await TwillioTokenService.hasChannel(req.body['ChannelSid'])
            if (!hasChannel) return res.status(400).send('bad request')

            const managers = await User.getManagers()

            const username = req.body['From']

            if (username.match(/^manager_/)) {
                return res.status(200).send('sended!')
            }

            const notificationContent = createNewMessageInSupportNotificationContent(username, req.body['Body'])

            const promisses: Promise<UserNotificationHistory>[] = []

            for (const m of managers) {
                const notification = await UserNotificationHistory.addNotification(
                    m,
                    null,
                    notificationContent.content,
                    notificationContent.url,
                    NotificationTypes.NEW_MESSAGE_IN_SUPPORT
                )

                if (notification) {
                    // @ts-ignore
                    promisses.push(notification)
                }
            }

            // @ts-ignore
            await UserNotificationHistory.save(promisses)
        }

        return res.status(200).send('sended!')
    }

    static async notifyAboutManagerAnswer(req: Request, res: Response) {
        const message = req.body.message as string
        const username = req.body.username as string

        const url = '/profile/support'
        const href = `${process.env.ORIGIN}${url}`
        const template = GetNewSupportMessageEmailTemplate(message, href)
        const notificationContent = createNewMessageInSupportNotificationContent('support', message)

        if (!username) {
            return res.status(403).send('bad request')
        }

        try {
            const user = await User.findOneOrFail({ username })

            const notification = await UserNotificationHistory.addNotification(
                user,
                null,
                notificationContent.content,
                url,
                NotificationTypes.NEW_MESSAGE_IN_SUPPORT
            )

            if (notification) {
                await UserNotificationHistory.save(notification)
            }

            Mail.send(
                user.email,
                'New message from support',
                template,
                true
            )
        } catch {
            return res.status(403).send('bad request')
        }

        return res.status(200).send('sended')
    }

    static async onEmailAnswer(req: Request, res: Response) {
        let from = '', text = req.body.text

        try {
            const envelope = typeof req.body?.envelope === 'string' ? JSON.parse(req.body?.envelope) : ''
            from = envelope.from
        } catch (error) {
            Logger.error(`Error onEmailAnswer ${error}`)
        }

        let parsedText: string = ''
        const ignoreLineRegex = new RegExp(`(<${from}>)|(info@hotbids.online)|(info@hotbids)|(replied you on the)|(New message from support)|(--)|(tbody>)`, 'mi')
        const filterTextFn = v => !v.startsWith('>') && !ignoreLineRegex.test(v) && v !== '\n'

        parsedText = getTextFromHtmlString(req.body.html, filterTextFn)

        Logger.info(req.body.html)
        Logger.info(parsedText)

        const user = await User.findOne({
            where: {
                email: from
            }
        })
        
        try {
            if (user && parsedText) {
                await TwillioTokenService.addMessage(user, parsedText)
            }
        } catch (error) {
            Logger.error(`Error onEmailAnswer ${error}`)
        }
        
        res.status(200).send(parsedText)
    }
}

export default SupportController;
