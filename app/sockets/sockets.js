const QuestionController = require("../controllers/QuestionController").default
const CommentController = require("../controllers/CommentController").default
const BidController = require("../controllers/BidController").default
const SocketController = require("../controllers/SocketController").default
const SocketStorage = require("../helpers/SocketStorage").SocketStorage
const User = require('../models/User').User;
const Car = require('../models/Car').Car;
const Comment = require('../models/Comment').Comment;
const UserNotificationHistory = require('../models/UserNotificationHistory').UserNotificationHistory;
const TimerGenerator = require('../utils/timer').default;
const SocketClients = require('../utils/SocketClients').default;
const CarImage = require('../models/CarImage').CarImage;
const Statistic = require('../models/Statistic').Statistic;
const StatisticTypes = require('../models/Statistic').StatisticTypes;
const MetricWsOptions = require('../dictionaries/metrics/ws')
const UserManagerWsOptions = require('../dictionaries/userManager/ws')
const UserWsOptions = require('../dictionaries/user/ws')
const CarManagerWsOptions = require('../dictionaries/carManager/ws')

const moment = require('moment')

module.exports = function (server) {
    const _io = require('socket.io')(server, {
        connectTimeout: 10000,
        transports: ['websocket'],
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    const io = _io.of('/')
    const ioAdmin = _io.of('/admin')
    SocketController.managers.io = ioAdmin
    SocketController.socketClients.io = io

    const checkNotifications = async function () {
        for (const client of SocketController.socketClients.authenticatedClients) {
            try {
                await SocketController.tickNotification(client)
            } catch (error) { }
        }
    }

    const checkManagersNotifications = async function () {
        for (const client of SocketController.managers.authenticatedClients) {
            try {
                await SocketController.tickNotification(client)
            } catch (error) { }
        }
    }

    const checkCarEnd = async function () {
        try {
            await SocketController.tickCar()
        } catch (error) {
            console.log('err checkCarEnd', error)
        }
    }

    const checkCarDaily = async function (check = true) {
        const currentMoment = moment()
        if (currentMoment.get('s') >= 0 &&
            currentMoment.get('s') <= 10 &&
            currentMoment.get('h') === 19 &&
            currentMoment.get('m') === 00) {

            try {
                await Promise.allSettled([
                    Statistic.saveDailyVars(),
                    UserNotificationHistory.sendDailyNotification()
                ])
            } catch (error) {
                console.log(error)
            }
        }
    }

    const timerCheckNotifications = new TimerGenerator(checkNotifications, 3000)
    const timerCheckManagersNotifications = new TimerGenerator(checkManagersNotifications, 5000)
    const timerCheckCarEnd = new TimerGenerator(checkCarEnd, 5000)
    const timerCheckCarDaily = new TimerGenerator(() => checkCarDaily(), 10000)

    const getCar = async (id) => {
        return await Car.createQueryBuilder('car')
            .where('car.id = :id', { id })
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.bids', 'bids')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .getOne()
    }

    const setSocketUser = async (socket, next, isAdmin) => {
        const requestUser = socket.handshake.auth && socket.handshake.auth.user
        if (requestUser) {
            const token = requestUser.token || ''

            const user = await User.getByToken(token)

            if (isAdmin && user && user.allowAdminPanel) {
                socket.user = user
            } else if (user) {
                socket.user = user
            }
        }

        return next()
    }

    io.use(setSocketUser)
    ioAdmin.use((socket, next) => setSocketUser(socket, next, true))

    ioAdmin.on('connection', async (socket) => {
        SocketController.managers.push(socket)

        socket.on('disconnect', () => {
            SocketController.managers.remove(socket)
        })

        socket.on(MetricWsOptions.wsActions.ACTION_JOIN_TO_DASHBOARD, async (_params) => {
            socket.join(MetricWsOptions.wsRooms.ROOM_DASHBOARD)
            SocketController.managers.sendTo(socket, MetricWsOptions.wsEvents.JOIN_TO_DASHBOARD)
        })

        socket.on(UserManagerWsOptions.wsActions.ACTION_JOIN_TO_USER_MANAGER, async (_params) => {
            socket.join(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER)
            SocketController.managers.sendTo(socket, UserManagerWsOptions.wsEvents.JOIN_TO_USER_MANAGER)
        })

        socket.on(UserManagerWsOptions.wsActions.ACTION_DELETE_USER, async (_params) => {
            const result = await User.deleteUsers(_params.users, _params.lastUsers)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_DELETE_USER, result)
        })

        socket.on(UserManagerWsOptions.wsActions.ACTION_DELETE_COMMENTS, async (_params) => {
            const result = await Comment.deleteComments(_params.comments, _params.lastComments)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.COMMENT_DELETE, result)
        })

        socket.on(UserManagerWsOptions.wsActions.ACTION_EDIT_COMMENT, async (_params) => {
            const result = await Comment.editComment(_params.id, _params.comment)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_EDIT_COMMENT, { ..._params, ...result })
            io.to(`car-${result.carId}`).emit('updatedComment', { ..._params, ...result })
        })

        socket.on(UserWsOptions.wsActions.ACTION_READ_NOTIFICATION, async (_params) => {
            let result = null
            const params = {
                ..._params,
                user: socket.user
            }

            try {
                result = await UserNotificationHistory.readNotifications(params)
                SocketController.managers.sendTo(socket, UserWsOptions.wsEvents.USER_UPDATE_NOTITIFICATIONS, result)
            } catch (error) {
                result = error
            }
        })

        socket.on(CarManagerWsOptions.wsActions.ACTION_JOIN_TO_CAR_MANAGER, async () => {
            socket.join(CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER)
            SocketController.managers.sendTo(socket, CarManagerWsOptions.wsEvents.JOIN_TO_CAR_MANAGER)
        })

        socket.on(CarManagerWsOptions.wsActions.ACTION_VERIFY_CAR, async (_params) => {
            let result
            if (_params.verificationState === 'declined') {
                result = await Car.declineCar(_params.id, _params.declineReason, socket.user)
            } else if (_params.verificationState === 'approved') {
                result = await Car.approveCar(_params.id, socket.user)
            }
            SocketController.managers.sendToRoom(CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER, CarManagerWsOptions.wsEvents.CAR_MANAGER_UPDATE_CAR, { car: result })
        })
    })

    io.on('connection', async (socket) => {
        SocketController.socketClients.push(socket)
        Statistic.updateDailyVars(StatisticTypes.USER_ONLINE, SocketController.socketClients.uniqueUsersCount, true)
        const storage = new SocketStorage()

        socket.on('disconnect', () => {
            SocketController.socketClients.remove(socket)
            Statistic.updateDailyVars(StatisticTypes.USER_ONLINE, SocketController.socketClients.uniqueUsersCount, true)
        })

        socket.on('login', async (data) => {
            if (data.user.token) {
                const user = await User.getByToken(data.user.token)
                if (user) {
                    socket.user = user
                }
            }
        })

        socket.on('logout', () => {
            socket.user = null
        })

        /**
         * Comment api
         */
        socket.on('joinToCar', async (_params) => {
            const params = {
                ..._params,
                user: socket.user
            }
            const result = await CommentController.getComments(params)
            storage.car = await getCar(params.carId)

            socket.join(`car-${params.carId}`)
            socket.emit('joinedToCar', result)
        })

        socket.on('leaveRoomCar', async (_params) => {
            socket.leave(`car-${_params.carId}`)
            socket.leave(`car-question-${_params.carId}`)
            console.log(socket.rooms)
        })

        socket.on('addComment', async (comment) => {
            if (!socket.user) return

            const params = {
                ...comment,
                user: socket.user,
                car: await storage.getCarOrLoad(comment.carId)
            }
            const result = await CommentController._addComment(params)

            io.to(`car-${params.carId}`).emit('addedComment', result)
        })

        socket.on('editComment', async (comment) => {
            if (!socket.user) return

            const params = {
                ...comment,
                user: socket.user
            }

            const result = await CommentController._editComment(params)

            io.to(`car-${params.carId}`).emit('updatedComment', result)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_EDIT_COMMENT, result)
        })

        socket.on('setInappropriate', async (comment) => {
            if (!socket.user) return

            const params = {
                ...comment,
                user: socket.user
            }
            const result = await CommentController._setInappropriate(params)

            io.to(`car-${params.carId}`).emit('updatedComment', result)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_COMMENT, result)
        })

        socket.on('setUpvoted', async (comment) => {
            if (!socket.user) return

            const params = {
                ...comment,
                user: socket.user
            }
            const result = await CommentController._setUpvoted(params)

            io.to(`car-${params.carId}`).emit('updatedComment', result)
            SocketController.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_COMMENT, result)
        })

        /**
         * Question api
         */
        socket.on('joinToCarQuestion', async (question) => {
            const params = {
                ...question,
                user: socket.user
            }
            const result = await QuestionController._getQuestionsByCarId(params)

            socket.join(`car-question-${params.carId}`)
            io.to(`car-question-${params.carId}`).emit('joinedToCarQuestion', result)
        })

        socket.on('addQuestion', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user
            }

            const result = await QuestionController._addQuestion(params)

            io.to(`car-question-${params.carId}`).emit('addedQuestion', result)
        })

        socket.on('addAnswer', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user,
                car: storage.car
            }
            const result = await QuestionController._setAnswer(params)

            io.to(`car-question-${params.carId}`).emit('updatedQuestion', result)
        })

        socket.on('editQuestion', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user,
                car: storage.car
            }

            const result = await QuestionController._editQuestion(params)

            io.to(`car-question-${params.carId}`).emit('updatedQuestion', result)
        })

        socket.on('editAnswer', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user,
                car: storage.car
            }
            const result = await QuestionController._setAnswer(params)

            io.to(`car-question-${params.carId}`).emit('updatedQuestion', result)
        })

        socket.on('setInappropriateQuestion', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user
            }
            const result = await QuestionController._setInappropriate(params)

            io.to(`car-question-${params.carId}`).emit('updatedQuestion', result)
        })

        socket.on('setUpvotedQuestion', async (question) => {
            if (!socket.user) return

            const params = {
                ...question,
                user: socket.user
            }
            const result = await QuestionController._setUpvoted(params)

            io.to(`car-question-${params.carId}`).emit('updatedQuestion', result)
        })

        socket.on('placeBid', async (comment) => {
            if (!socket.user || !comment.bid || !storage.car) return
            const params = {
                ...comment,
                user: socket.user,
                car: storage.car,
                intentId: storage.stripeIntentId
            }

            let result

            try {
                result = await BidController.placeBidOrFail(params)
                storage.stripeIntentId = result.intentId
            } catch (error) {
                result = error
            }

            io.to(`car-${params.carId}`).emit('placeBid', result)

            SocketController.managers.sendToRoom(CarManagerWsOptions.wsRooms.ROOM_CAR_MANAGER, CarManagerWsOptions.wsEvents.CAR_MANAGER_NEW_BID, result)
        })

        socket.on('readNotifications', async (ids) => {
            if (!socket.user) return

            const params = {
                ...ids,
                user: socket.user
            }

            let result

            try {
                result = await UserNotificationHistory.readNotifications(params)
                storage.stripeIntentId = result.intentId
            } catch (error) {
                result = error
            }

            socket.emit('readNotifications', result)
        })
    })
}
