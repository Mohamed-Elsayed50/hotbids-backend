import { Socket } from "socket.io";
import { User } from '../models/User';
import { NotificationTypes, UserNotificationHistory } from '../models/UserNotificationHistory';
import { Memcache } from '../helpers/Memcache';
import moment from 'moment';
import { Car } from '../models/Car';
import CommentController from './CommentController'
import SocketClients, { SocketClient } from '../utils/SocketClients';
import { CarImage } from "../models/CarImage";
import { createAuctionEndingSoonNotificationContent, createAuctionEndNotificationContent, createAuctionStartedNotificationContent } from "../dictionaries/notification/CarNotification";
import { StatisticTypes, Statistic } from "../models/Statistic";
import { UserRole } from "../dictionaries/user/UserRole";
import * as UserManagerWsOptions from '../dictionaries/userManager/ws'
import * as CarManagerWsOptions from '../dictionaries/carManager/ws'
import * as CarWsOptions from '../dictionaries/car/ws'
import BidController from "./BidController";

class SocketController {
    static tickInterval: number = 10000//10 seconds
    static readonly socketClients = new SocketClients()
    static readonly managers = new SocketClients()

    user: User | undefined
    carId: number | undefined
    car: Car | undefined
    lastKnownBidDate: Date | undefined
    lastNotificationDate: number | undefined
    timerId

    static connection(socket: Socket) {
        return new SocketController(socket)
    }

    constructor(
        public socket: Socket
    ) {
        this.bindEvents()
    }

    bindEvents() {
        // this.socket.on('notificationReaded', this.notificationReaded)
        // this.socket.on('placeBid', this.placeBid)
        // this.socket.on('joinToCar', this.joinToCar)
    }

    async joinToCar(socket, params) {
        const result = await CommentController.getComments(params)
        socket.join(`car-${params.carId}`)
        socket.broadcast.emit('joinedToCar', result)
    }


    async notificationReaded(notificationId) {
        if (!notificationId) {
            this.socket.send({ type: 'notificationReaded', status: false, message: 'empty notificationId' })
            return
        }

        let notification: UserNotificationHistory
        try {
            notification = await UserNotificationHistory.readNotification(notificationId)
        } catch (err) {
            this.socket.send({ type: 'notificationReaded', status: false, message: 'notification not found' })
            return
        }

        this.socket.send({ type: 'notificationReaded', status: true })
    }

    async disconnect(data) {
        this.user = undefined
        this.carId = undefined
        this.car = undefined
        this.lastKnownBidDate = undefined
        if (this.timerId)
            clearTimeout(this.timerId)
    }

    async login(userId: number, token: string) {
        this.user = await User.getByIdAndToken(userId, token)

        if (!this.user) {
            this.socket.send('auth failed')
            return
        }

        this.socket.send('auth successfully')
        this.tick()
    }

    setTimer() {
        this.timerId = setTimeout(() => this.tick(), SocketController.tickInterval)
    }

    async tick() {
        // await this.tickNotification()
        // await this.tickCar()

        this.setTimer()
    }

    static async tickNotification(client: SocketClient) {
        let latest
        try {
            latest = await Memcache.get(`last-user-${client.user.id}-notification`)
        } catch (error) {
        }
        if (client.lastNotificationDate && latest && client.lastNotificationDate >= latest) return

        let notifications = await UserNotificationHistory.getUserNotifications(client.user)
        if (!notifications || notifications.length <= 0) return

        client.emit('notifications', notifications)

        client.lastNotificationDate = moment(notifications[notifications.length - 1].createdAt).valueOf()

        try {
            // @ts-ignore
            await Memcache.add(`last-user-${client.user.id}-notification`, client.lastNotificationDate)
        } catch (err) {
        }
    }

    static CARS = {
        ended: new Set<number>()
    } 

    static async tickCar() {
        const checkLiveAuctions = async () => {
            const cars = await Car.getLiveAuctions()
            Statistic.updateDailyVars(StatisticTypes.LIVE_AUCTIONS, cars.length)
            cars.forEach(c => {
                if (SocketController.CARS.ended.has(c.id)) {
                    SocketController.CARS.ended.delete(c.id)
                }
            })
        }

        // Check ending soon cars
        const checkEndingSoonCars = async () => {
            const endingSoonCars = await Car.createQueryBuilder('car')
                .where('car.verified = :v', { v: 1 })
                .andWhere('car.endDate > CURRENT_TIMESTAMP')
                .andWhere('TIMESTAMPDIFF(HOUR, CURRENT_TIMESTAMP, car.endDate) <= 2')
                .leftJoinAndSelect('car.watched', 'watched')
                .leftJoinAndSelect('watched.user', 'user', 'user.notify_before_auction_ends_in_watch_list = 1')
                .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
                .select([
                    'car.id',
                    'car.title',
                    'car.endDate',
                    'carImages',
                    'watched',
                    'user',
                ])
                .getMany()

            const promisses = endingSoonCars.map(c => this.createEndingSoonCarNotification(c))
            await Promise.allSettled(promisses)
        }

        // Check ended cars
        const checkEndedCars = async () => {
            const endedCars = await Car.createQueryBuilder('car')
                .where('car.verified = 1')
                .andWhere('TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, car.endDate) > -9 AND TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, car.endDate) <= 0')
                .leftJoinAndSelect('car.watched', 'watched')
                .leftJoinAndSelect('car.bids', 'bids')
                .leftJoinAndSelect('watched.user', 'user', 'user.notify_auction_results_in_watch_list = 1')
                .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
                .select([
                    'car.id',
                    'car.title',
                    'car.endDate',
                    'car.reserve',
                    'car.reserveValue',
                    'carImages',
                    'watched',
                    'user',
                    'bids',
                    'bids.bid'
                ])
                .getMany()

            const promisses = endedCars
                .filter(c => !SocketController.CARS.ended.has(c.id))
                .map(async c => {
                    return Promise.allSettled([
                        this.createEndedCarNotification(c),
                        this.createEndedCarNotificationForManagers(c),
                        BidController.getPaymentFromCaptured(c)
                    ])
                })

            try {
                await Promise.allSettled(promisses)
            } finally {
                endedCars.forEach(c => {
                    SocketController.CARS.ended.add(c.id)
                })
            }             
        }

        // Check new car is started
        const checkNewCarIsStarted = async () => {
            const startedCars = await Car.createQueryBuilder('car')
                .where('car.verified = 1')
                .andWhere('TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, car.startDate) >= 5 AND TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, car.startDate) < 11')
                .leftJoinAndSelect('car.watched', 'watched')
                .leftJoinAndSelect('car.bids', 'bids')
                .leftJoinAndSelect('watched.user', 'user', 'user.notify_auction_results_in_watch_list = 1')
                .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
                .select([
                    'car.id',
                    'car.title',
                    'car.endDate',
                    'car.startDate',
                    'carImages',
                    'watched',
                    'user',
                    'bids',
                    'bids.bid'
                ])
                .getMany()

            const promisses = startedCars.map(async c => {
                return Promise.allSettled([
                    this.createStartedCarNotification(c),
                    this.createStartedCarNotificationForManagers(c),
                    UserNotificationHistory.sendNewAuctionNotification(c),
                ])
            })

            await Promise.allSettled(promisses)
        }

        const results = await Promise.allSettled([
            checkLiveAuctions(),
            checkNewCarIsStarted(),
            checkEndingSoonCars(),
            checkEndedCars(),
            Statistic.sendDailyVars()
        ])
    }

    static async createStartedCarNotification(car: Car) {
        const noitifications: UserNotificationHistory[] = []
        const notificationContent = createAuctionStartedNotificationContent(car)

        const managers = await User.getManagers()

        for (const manager of managers) {
            const n = await UserNotificationHistory.addNotification(
                manager,
                car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.NEW_AUCTION
            )

            if (n) {
                noitifications.push(n)
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async createEndingSoonCarNotification(car: Car) {
        const noitifications: UserNotificationHistory[] = []

        for (const wcar of car.watched) {
            if (wcar.user) {
                const notificationContent = createAuctionEndingSoonNotificationContent(car)
                const n = await UserNotificationHistory.addNotification(
                    wcar.user,
                    car,
                    notificationContent.content,
                    notificationContent.url,
                    NotificationTypes.AUCTION_ENDING_SOON
                )

                if (n) {
                    noitifications.push(n)
                }
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async createStartedCarNotificationForManagers(car: Car) {
        SocketController.managers.sendToRoom(
            UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER,
            UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER_CAR,
            { car }
        )

        const noitifications: UserNotificationHistory[] = []
        const notificationContent = createAuctionStartedNotificationContent(car)

        const managers = await User.getManagers()

        for (const manager of managers) {
            const n = await UserNotificationHistory.addNotification(
                manager,
                car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.AUCTION_STARTED
            )

            if (n) {
                noitifications.push(n)
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async createEndedCarNotificationForManagers(car: Car) {
        SocketController.managers.sendToRoom(
            UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER,
            UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER_CAR,
            { car }
        )
        SocketController.managers.sendToRoom(
            CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER,
            CarManagerWsOptions.wsEvents.CAR_MANAGER_CAR_ENDED,
            { car }
        )

        const noitifications: UserNotificationHistory[] = []
        const notificationContent = createAuctionEndNotificationContent(car)

        const managers = await User.getManagers()

        for (const manager of managers) {
            const n = await UserNotificationHistory.addNotification(
                manager,
                car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.AUCTION_ENDED
            )

            if (n) {
                noitifications.push(n)
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async createEndedCarNotification(car: Car) {
        const noitifications: UserNotificationHistory[] = []
        const notificationContent = createAuctionEndNotificationContent(car)

        for (const wcar of car.watched) {
            if (wcar.user) {
                const n = await UserNotificationHistory.addNotification(
                    wcar.user,
                    car,
                    notificationContent.content,
                    notificationContent.url,
                    NotificationTypes.AUCTION_ENDED
                )

                if (n) {
                    noitifications.push(n)
                }
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static onChangeCarStatus(car: Car) {
        switch (Number(car.status)) {
            case Car.STATUS.Pause: {
                SocketController.socketClients.sendToRoom(
                    CarWsOptions.ROOM_CAR(car),
                    CarWsOptions.wsEvents.CAR_PAUSE
                )
                break
            }
            case Car.STATUS.Continue: {
                SocketController.socketClients.sendToRoom(
                    CarWsOptions.ROOM_CAR(car),
                    CarWsOptions.wsEvents.CAR_CONTINUE
                )
                break
            }
            case Car.STATUS.Restart: {
                SocketController.socketClients.sendToRoom(
                    CarWsOptions.ROOM_CAR(car),
                    CarWsOptions.wsEvents.CAR_RESTART
                )
                break
            }
            case Car.STATUS.Finish: {
                SocketController.socketClients.sendToRoom(
                    CarWsOptions.ROOM_CAR(car),
                    CarWsOptions.wsEvents.CAR_FINISH
                )
                break
            }
        }
    }

    static onUpdatedCar(car: Car) {
        SocketController.socketClients.sendToRoom(
            CarWsOptions.ROOM_CAR(car),
            CarWsOptions.wsEvents.CAR_UPDATED
        )
    }

    static onNewCarAdded(car: Car) {
        SocketController.managers.sendToRoom(
            CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER,
            CarManagerWsOptions.wsEvents.CAR_MANAGER_NEW_CAR,
            car
        )
    }

    static onNewAuctionAdded(car: Car) {
        SocketController.managers.sendToRoom(
            CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER,
            CarManagerWsOptions.wsEvents.AUCTION_MANAGER_NEW_CAR,
            car
        )
    }
}

export default SocketController;
