import {
    BaseEntity, BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import moment from "moment";
import { Memcache } from "../helpers/Memcache";
import { Mail } from "../helpers/Mail";
import { Car } from "./Car";
import {
    GetAuctionEndedSoonNotificationEmailTemplate,
    GetAuctionEdningSoonNotificationEmailTemplate,
    GetDailyEmailTemplate,
    GetNewBidNotificationEmailTemplate,
    GetNewCommentNotificationEmailTemplate,
    GetQuestionAnsweredNotificationEmailTemplate,
    GetRepliedCommentNotificationEmailTemplate,
    GetNewAuctionNotificationEmailTemplate,
    GetNewCarPendingApprovalNotificationEmailTemplate
} from "../helpers/GetEmailTemlate";
import { CarImage } from "./CarImage";
import convertNumberToCurrency from "../utils/convertNumberToCurrency";
import { Question } from "./Question";
import { Subscriber } from "./Subscriber";
import convertNumberToDecimal from "../utils/convertNumberToDecimal";
import { createAuctionAwaitingApprovalNotificationContent } from "../dictionaries/notification/CarNotification";

export enum NotificationTypes {
    NEW_BID,
    NEW_COMMENT,
    NEW_AUCTION,
    NEW_PENDING_AUCTION,
    NEW_MESSAGE_IN_SUPPORT,
    REPLIED_COMMENT,
    AUCTION_ENDING_SOON,
    AUCTION_ENDED,
    AUCTION_STARTED,
    QUESTION_ANSWERED
}
@Index("user_notification_history_to_user", ["userId"], {})
@Entity("user_notification_history", { schema: "bids" })
export class UserNotificationHistory extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("int", { name: "user_id", nullable: true })
    userId: number | null;

    @Column("int", { name: "unreaded_count", default: 0 })
    unreadedCount: number | 0;

    @Column("int", { name: "readed_count", default: 0 })
    readedCount: number | 0;

    @Column("text", { name: "content", nullable: true })
    content: string | null;

    @Column("varchar", { name: "url", nullable: true, length: 255 })
    url: string | null;

    @Column("datetime", { name: "created_at", nullable: true })
    createdAt: Date | null;

    @Column("datetime", { name: "updated_at", nullable: true })
    updatedAt: Date | null;

    @ManyToOne(() => User, (user) => user.userNotificationHistories, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @BeforeInsert()
    beforeInsert() {
        let momentDate = moment()
        this.createdAt = momentDate.toDate()
        this.updatedAt = momentDate.toDate()

        if (!this.userId && this.user) {
            this.userId = this.user.id
        }

        try {
            Memcache.set(`last-user-${this.userId}-notification`, momentDate.valueOf())
        } catch (error) { }
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updatedAt = moment().toDate()
    }

    static async getNotReadedUserNotifications(user: User | undefined): Promise<UserNotificationHistory[] | undefined> {
        if (!user) return
        return await UserNotificationHistory.createQueryBuilder('unh')
            .where({ user: user, readed: 0 })
            .orderBy('unh.createdAt', 'ASC')
            .getMany()
    }

    static async getUserNotifications(user: User) {
        return await UserNotificationHistory.createQueryBuilder('nh')
            .where({ user: user })
            .andWhere('TIMESTAMPDIFF(HOUR, nh.updatedAt, CURRENT_TIMESTAMP) <= 24')
            .orderBy('nh.updatedAt', 'DESC')
            .getMany()
    }

    static async getAllSubscribers() {
        let subscribers = await Subscriber.find()
        let currentUsers = await User.find()

        subscribers = subscribers.filter(s => {
            const user = currentUsers.find(u => u.email === s.email)

            return user ? user.verified && user.sendDailyEmail : true
        })

        currentUsers = currentUsers.filter(u => u.verified && u.sendDailyEmail)

        let users = [...currentUsers, ...subscribers].filter((u, index, arr) => {
            return index === arr.findIndex(_u => _u.email === u.email)
        })

        return users
    }

    static async sendNewCarPendindApproval(car: Car) {
        const managers = await User.getManagers()

        try {
            const carImage = await car.getFirstImage()
            car.carImages = [carImage]
        } catch (error) {
            car.carImages = [new CarImage()]
        }

        const notificationContent = createAuctionAwaitingApprovalNotificationContent(car)
        const noitifications: UserNotificationHistory[] = []

        for (const manager of managers) {
            try {
                const n = await UserNotificationHistory.addNotification(
                    manager,
                    car,
                    notificationContent.content,
                    notificationContent.url,
                    NotificationTypes.NEW_PENDING_AUCTION
                )

                if (n) {
                    noitifications.push(n)
                }
            } catch (error) {
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async sendNewAuctionNotification(_car: Car) {
        const car = _car.carImages ? _car : await Car.getCarWithImages(_car.id)
        const users = await UserNotificationHistory.getAllSubscribers()
        const template = GetNewAuctionNotificationEmailTemplate({
            title: car.title || '',
            imgUrl: (car.carImages[0] || {}).url || '',
            carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
        })

        for (let uIndex = 0; uIndex < users.length; uIndex++) {
            const user = users[uIndex];

            Mail.send(
                user.email,
                `New auction on the ${car.title}.`,
                template,
                true
            )
        }
    }

    static async sendDailyNotification() {
        const users = await UserNotificationHistory.getAllSubscribers()

        let endedCars: any[] = await Car.createQueryBuilder('car')
            .where('car.verified = 1')
            .andWhere('TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP, car.endDate) = 0')
            .andWhere('car.endDate > CURRENT_TIMESTAMP')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.location', 'location')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('bids.user', 'bidsUser')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .select([
                'car',
                'carImages',
                'bids',
                'location',
                'owner',
                'owner.username',
                'bidsUser',
                'bidsUser.username'
            ])
            .getMany()

        let newCars: any[] = await Car.createQueryBuilder('car')
            .where('car.verified = 1')
            .andWhere('TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP, car.createdAt) = 0')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.location', 'location')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('bids.user', 'bidsUser')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .select([
                'car',
                'carImages',
                'location',
                'bids',
                'owner',
                'owner.username',
                'bidsUser',
                'bidsUser.username'
            ])
            .getMany();

        endedCars = endedCars.map(c => {
            const maxBid = Math.max.apply(Math, c.bids.map(bid => bid.bid))
            const winner = (c.bids.find(b => b.bid === maxBid) || { user: {} }).user.username
            return {
                ...c,
                maxBid: convertNumberToCurrency(maxBid),
                url: `${process.env.ORIGIN}/auctions/${c.id}`,
                image: c.carImages && c.carImages.length ? c.carImages[0].url : '',
                title: c.title,
                date: moment(c.endDate).format('HH:MMa'),
                winner
            }
        })

        newCars = newCars.map(c => {
            return {
                ...c,
                url: `${process.env.ORIGIN}/auctions/${c.id}`,
                image: c.carImages && c.carImages.length ? c.carImages[0].url : '',
                title: c.title,
                date: moment(c.endDate).format('HH:MMa'),
                reverse: c.reserve ? 'Reverse' : 'No reverse',
                seller: c.owner.username
            }
        })

        function getCarSubtitle({ transmission, mileage }) {
            const m: any[] = []

            transmission && m.push(transmission)
            mileage && m.push(`~${convertNumberToDecimal(mileage)} Miles`)

            return m.join(', ')
        }

        function capitalizeString(str) {
            if (!str) return ''
            const words = str.toLowerCase().split(' ');

            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }

            return words.join(' ')
        }

        function getCarLocation({ location }) {
            if (!location) return ''
            return `${capitalizeString(location.city)}, ${location.state} ${location.zipCode}`
        }

        endedCars = endedCars.length === 0 ? '<tr><td>No auctions ended today.</td></tr>' : endedCars.reduce((str, c) => str + `
                        <tr>
                            <td
                                align="center"
                                style="padding-bottom:11px"
                                >
                                <a
                                    href="${c.url}"
                                    target="_blank"
                                >
                                    <img
                                        width="500"
                                        height="329"
                                        style="display:block;padding:0;border:0;border-radius:3px"
                                        src="${c.image}" alt=""
                                        border="0"
                                    />
                                </a>

                            </td>
                        </tr>

                        <tr>
                            <td style="padding-bottom: 35px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="left">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding-bottom: 7px;">
                                                                <table border="0" cellpadding="0" cellspacing="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; background: #262626; border-radius: 6px; font-size: 12px; font-weight: 700; color: #fff; padding: 2px 7px;">
                                                                                <span style="color: #bdbdbd; font-weight: 400;">Bid</span> ${c.maxBid}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 23px; font-size: 17px; font-weight: 600;">
                                                                <a
                                                                    href="${c.url}"
                                                                    style="color: #202124;"
                                                                    target="_blank"
                                                                >
                                                                    ${c.title}
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 21px; font-size: 15px; color: #202124;">${getCarSubtitle(c)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 21px; font-size: 15px; color: #828282;">${getCarLocation(c)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                `.replace(/\n/g, ''), '');

        newCars = newCars.length === 0 ? '' : newCars.reduce((acc, c) => acc + `
            <tr>
                <td
                    align="center"
                    style="padding-bottom:11px"
                    class="m_9199855055071283069padding"
                    >
                    <a
                        href="${c.url}"
                        target="_blank"
                    >
                        <img
                            width="500"
                            height="329"
                            style="display:block;padding:0;border:0;border-radius:3px"
                            src="${c.image}" alt=""
                            border="0"
                        />
                    </a>
                </td>
            </tr>
            <tr>
                <td style="padding-bottom: 35px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tbody>
                            <tr>
                                <td align="left">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td style="padding-bottom: 7px;">
                                                    <table border="0" cellpadding="0" cellspacing="0">
                                                        <tbody>
                                                            <tr>
                                                                <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 700; background: #5b30d6; border-radius: 6px; font-size: 11px; color: #fff; padding: 2px 7px;">NEW</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 23px; font-size: 17px; font-weight: 600;">
                                                    <a
                                                        href="${c.url}"
                                                        style="color: #202124;"
                                                        target="_blank"
                                                    >
                                                        ${c.title}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 21px; font-size: 15px; color: #202124;">${getCarSubtitle(c)}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-family: 'Open Sans', Helvetica, Arial, sans-serif; line-height: 21px; font-size: 15px; color: #828282;">${getCarSubtitle(c)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            `.replace(/\n/g, ''), '')

        const template = GetDailyEmailTemplate({
            endedCars,
            newCars,
            homepageUrl: process.env.ORIGIN || ''
        })
        for (let uIndex = 0; uIndex < users.length; uIndex++) {
            const user = users[uIndex];

            Mail.send(
                user.email,
                `HotBids Today.`,
                template,
                true
            )
        }
    }

    static async readNotification(id: any) {
        let notification: UserNotificationHistory

        notification = await UserNotificationHistory.findOneOrFail({
            where: { id }
        })

        notification.readedCount += notification.unreadedCount
        notification.unreadedCount = 0
        await notification.save()

        return notification
    }

    static async readNotifications({ ids, user }: { ids: number[], user: User }) {
        const notifications = await UserNotificationHistory.find({
            where: ids.map(id => ({ id, user }))
        })

        notifications.forEach(n => {
            n.readedCount += n.unreadedCount
            n.unreadedCount = 0
        })

        await this.save(notifications)

        return notifications
    }

    static async addNotification(user: User, car: Car | null, content: string, url: string, type: NotificationTypes, data: Question | Comment | null = null) {
        let notification: UserNotificationHistory | null = null

        try {
            notification = await UserNotificationHistory.findOneOrFail({
                where: {
                    user,
                    content
                }
            })
        } catch (error) {
            // console.log('addNotification', error)
        }

        if (notification) {
            if (type === NotificationTypes.AUCTION_ENDED ||
                type === NotificationTypes.AUCTION_ENDING_SOON) return;

            notification.unreadedCount += 1
        } else {
            notification = new UserNotificationHistory()
            notification.content = content
            notification.userId = user.id
            notification.unreadedCount = 1
            notification.url = url
        }

        if (car) {
            UserNotificationHistory.sendNotificationViaEmailIfNeed(user, car, type, data)
        }

        return notification
    }

    static async sendNotificationViaEmailIfNeed(user: User, car: Car, type: NotificationTypes, data: Question | Comment | null = null) {
        const isSeller = car.owner && (user.id === car.owner.id)
        const sendNewBidsViaEmailToSeller = isSeller && user.sendNewBidsViaEmail
        const senNewCommentViaEmailToSeller = isSeller && user.sendNewCommentsViaEmail

        if ((isSeller ? sendNewBidsViaEmailToSeller : user.sendWatchListNotificationViaEmail) && type === NotificationTypes.NEW_BID) {
            const template = GetNewBidNotificationEmailTemplate({
                title: car.title || '',
                bidderUsername: user.username || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
                bid: Math.max.apply(Math, car.bids.map(bid => bid.bid))
            })

            Mail.send(
                user.email,
                `New bid on the ${car.title}`,
                template,
                true
            )
        } else if (user.sendWatchListNotificationViaEmail && type === NotificationTypes.AUCTION_ENDING_SOON) {
            const template = GetAuctionEdningSoonNotificationEmailTemplate({
                title: car.title || '',
                endDate: moment(car.endDate).format('HH:MMa'),
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `${car.title} is ending soon.`,
                template,
                true
            )

        } else if (user.sendWatchListNotificationViaEmail && type === NotificationTypes.AUCTION_ENDED) {
            const bid = Math.max.apply(Math, car.bids.map(bid => bid.bid))
            const template = GetAuctionEndedSoonNotificationEmailTemplate({
                title: car.title || '',
                soldText: `${car.title} was sold for ${convertNumberToCurrency(bid)}.`,
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `Auction ended on the ${car.title}.`,
                template,
                true
            )
        } else if (data && (isSeller ? senNewCommentViaEmailToSeller : user.sendWatchListNotificationViaEmail) && type === NotificationTypes.NEW_COMMENT) {
            const template = GetNewCommentNotificationEmailTemplate({
                title: car.title || '',
                username: data.user.username || '',
                text: (data as Comment).comment || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `New comment on the ${car.title}.`,
                template,
                true
            )
        } else if (data && user.notifyWhenSomeoneRepliesInComment && type === NotificationTypes.REPLIED_COMMENT) {
            const template = GetRepliedCommentNotificationEmailTemplate({
                title: car.title || '',
                username: data.user.username || '',
                text: (data as Comment).comment || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `Replied comment on the ${car.title}.`,
                template,
                true
            )
        } else if (data && user.sendWatchListNotificationViaEmail && type === NotificationTypes.QUESTION_ANSWERED) {
            const template = GetQuestionAnsweredNotificationEmailTemplate({
                title: car.title || '',
                usernameAnswer: car.owner.username || '',
                answer: (data as Question).answer || '',
                usernameQuestion: (data as Question).user.username || '',
                question: (data as Question).question || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `A question on the ${car.title} was answered.`,
                template,
                true
            )
        } else if (type === NotificationTypes.NEW_AUCTION) {
            const template = GetNewAuctionNotificationEmailTemplate({
                title: car.title || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.ORIGIN}/auctions/${car.id}`,
            })

            Mail.send(
                user.email,
                `New auction on the ${car.title}.`,
                template,
                true
            )
        } else if (type === NotificationTypes.NEW_PENDING_AUCTION) {
            const template = GetNewCarPendingApprovalNotificationEmailTemplate({
                title: car.title || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.BASE_URL_ADMIN_PANEL}/auctions/${car.id}`
            })

            Mail.send(
                user.email,
                `New car ${car.title} is awaiting approval.`,
                template,
                true
            )
        } else if (user.isAdmin && type === NotificationTypes.AUCTION_ENDED) {
            const bid = Math.max.apply(Math, car.bids.map(bid => bid.bid))
            const template = GetAuctionEndedSoonNotificationEmailTemplate({
                title: car.title || '',
                soldText: `${car.title} was sold for ${convertNumberToCurrency(bid)}.`,
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.BASE_URL_ADMIN_PANEL}/auctions/${car.id}`
            })

            Mail.send(
                user.email,
                `New car ${car.title} is awaiting approval.`,
                template,
                true
            )
        } else if (user.isAdmin && type === NotificationTypes.AUCTION_STARTED) {
            const template = GetNewAuctionNotificationEmailTemplate({
                title: car.title || '',
                imgUrl: (car.carImages[0] || {}).url || '',
                carUrl: `${process.env.BASE_URL_ADMIN_PANEL}/auctions/${car.id}`
            })

            Mail.send(
                user.email,
                `New car ${car.title} is awaiting approval.`,
                template,
                true
            )
        }
    }
}
