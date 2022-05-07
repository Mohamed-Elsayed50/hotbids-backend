import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Car } from '../models/Car';
import { User } from '../models/User';
import { ErrorSignInUsernameNotFound } from '../dictionaries/validation/UsernameErrors';
import { Bid } from '../models/Bid';
import { CarWatched } from '../models/CarWatched';
import { CarImage } from '../models/CarImage';
import { NotificationTypes, UserNotificationHistory } from '../models/UserNotificationHistory';
import { createNewCommentNotificationContent, createReplyCommentNotificationContent } from '../dictionaries/notification/CommentNotification';

const checkUserActions = async (user: User | null, comments: Comment[], sort = { field: 'createdAt', desc: 1 }) => {
    const commentsFull = await Comment.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.commentInappropriates', 'commentInappropriates')
        .leftJoinAndSelect('comment.commentLikes', 'commentLikes')
        .where('comment.id IN (:ids)', { ids: [...comments.map(c => c.id)] })
        .orderBy(`comment.${sort.field}`, sort.desc ? 'DESC' : 'ASC')
        .getMany();

    const removeUnsedFields = (arr: Array<any>) => {
        arr.forEach(item => {
            delete item.commentInappropriates
            delete item.commentLikes
        })
    }

    if (user) {
        const commentsAuth = commentsFull.map(c => ({
            ...c,
            likedBy: c.commentLikes,
            inappropriateBy: c.commentInappropriates
        }))

        removeUnsedFields(commentsAuth)

        return commentsAuth
    } else {
        const commentsNoAuth = [...commentsFull]

        removeUnsedFields(commentsNoAuth)

        return commentsNoAuth
    }
}

class CommentController {
    static readonly commentSortingParams = {
        new: 1,
        upvoted: 2,
        seller: 3,
        bid: 4,
    }

    static async getComments({ carId, orderBy, sort, take, skip, loadUpToId }) {
        const commentsQuery = await Comment.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.commentInappropriates', 'commentInappropriates')
            .leftJoinAndSelect('comment.commentLikes', 'commentLikes')
            .where('comment.carId = :carId', { carId })
            .orderBy('comment.createdAt', 'DESC')
            .skip(skip || 0)
            .take(take || 15)


        if (sort && CommentController.commentSortingParams[sort as string]) {
            switch (CommentController.commentSortingParams[sort as string]) {
                case CommentController.commentSortingParams.new: {
                    commentsQuery.andWhere('comment.replyToCommentId IS NULL')

                    let loadUpToDate
                    if (loadUpToId) {
                        let loadUpToComment = await Comment.createQueryBuilder('comment')
                            .where('id = :id', { id: loadUpToId })
                            .getOne()

                        while (loadUpToComment && loadUpToComment.replyToCommentId) {
                            loadUpToComment = await Comment.createQueryBuilder('comment')
                                .where('comment.id = :id', { id: loadUpToComment.replyToCommentId })
                                .getOne()
                        }

                        if (loadUpToComment) {
                            loadUpToDate = loadUpToComment.createdAt
                            commentsQuery.andWhere('comment.createdAt >= :date', { date: loadUpToDate })
                            commentsQuery.take()
                        }
                    }

                    let [comments, count] = await commentsQuery.getManyAndCount()

                    if (loadUpToDate) {
                        let extraComments = await commentsQuery
                            .where('comment.createdAt < :date', { date: loadUpToDate })
                            .andWhere('comment.replyToCommentId IS NULL')
                            .take(15)
                            .getMany()

                        comments.push(...extraComments)
                    }

                    let commentsToCheck = comments
                    while (commentsToCheck.length) {
                        const replies = await Comment.createQueryBuilder('comment')
                            .leftJoinAndSelect('comment.user', 'user')
                            .leftJoinAndSelect('comment.commentInappropriates', 'commentInappropriates')
                            .leftJoinAndSelect('comment.commentLikes', 'commentLikes')
                            .where('comment.replyToCommentId IN (:...ids)', { ids: [...commentsToCheck.map(c => c.id)] })
                            .getMany()
                        commentsToCheck = replies.filter(reply => {
                            const exists = comments.find(comment => comment.id === reply.id)
                            if (!exists) {
                                comments.push(reply)
                            }
                            return !exists
                        })
                    }

                    return {
                        count,
                        comments,
                    }

                }
                case CommentController.commentSortingParams.upvoted: {
                    commentsQuery.leftJoinAndSelect('comment.replyToComment', 'replyToComment')
                    commentsQuery.orderBy('comment.likes', 'DESC')
                    break;
                }
                case CommentController.commentSortingParams.seller: {
                    commentsQuery.leftJoinAndSelect('comment.replyToComment', 'replyToComment')
                    commentsQuery.andWhere('comment.seller = 1')
                    break;
                }
                case CommentController.commentSortingParams.bid: {
                    commentsQuery.andWhere('comment.isBid = 1')
                    break;
                }
            }
        }

        let [comments, count] = await commentsQuery.getManyAndCount()

        const repliesToUsersIds = comments.map(c => c.replyToComment && c.replyToComment.userId)

        if (repliesToUsersIds.length) {
            const users = await User.createQueryBuilder('user')
                .where('user.id IN (:...ids)', { ids: repliesToUsersIds })
                .getMany()
            comments = comments.map(c => {
                const user = users.find(u => c.replyToComment && u.id === c.replyToComment.userId)
                if (user) {
                    c.replyToComment.user = user
                }
                return c
            })
        }

        return {
            count,
            comments
        }
    }

    static async getUserComments(req: Request, res: Response) {
        if (!req.params.username) {
            return res.status(400).json(new ErrorSignInUsernameNotFound())
        }

        let user: User

        try {
            user = await User.findOneOrFail({
                where: {
                    username: req.params.username
                }
            })
        } catch (error) {
            return res.status(404).json(new ErrorSignInUsernameNotFound())
        }

        try {
            const [comments, count] = await Comment.createQueryBuilder('comment')
                .leftJoinAndSelect('comment.replyToComment', 'replyToComment')
                .leftJoinAndSelect('comment.car', 'car')
                .leftJoinAndSelect('car.bids', 'bids')
                .leftJoinAndSelect('car.carImages', 'carImages')
                .leftJoinAndSelect('replyToComment.user', 'replyToCommentUser')
                .where('comment.userId = :userId', { userId: user.id })
                .andWhere('comment.isBid is NULL')
                .orderBy('comment.createdAt', 'DESC')
                .skip(req.query.skip ? Number(req.query.skip) : 0)
                .take(10)
                .select([
                    'replyToCommentUser.username',
                    'replyToComment.id',
                    'car.title',
                    'car.id',
                    'car.endDate',
                    'carImages',
                    'bids',
                    'comment.id',
                    'comment.comment',
                    'comment.likes',
                    'comment.edited',
                    'comment.createdAt',
                ])
                .getManyAndCount()

            return res.status(200).send({ comments, count })
        } catch (error) {
            console.log(error)
            return res.status(400).send('bad request')
        }

    }

    static async getCommentsByCarId(req: Request, res: Response) {
        const { sort, take, skip, orderBy, loadUpToId } = req.query
        const carId = req.params.carId
        const { count, comments } = await CommentController.getComments({ carId, sort, take, skip, orderBy, loadUpToId })

        if (!comments || comments.length === 0) {
            res.status(404).send('car or comments not found')
            return
        }

        res.send({
            count,
            comments
        })
    }

    static async _setUpvoted(params) {
        const { carId, commentId, user } = params
        let comment: Comment;

        try {
            await Car.findOneOrFail(carId)
            comment = await Comment.findOneOrFail(commentId)
        } catch (error) {
            throw new Error('car or comment not found')
        }

        try {
            // @ts-ignore
            await comment.tryToAddVote(user)
        } catch (e) {
            throw new Error('bad request')
        }

        const fullComment = await checkUserActions(user, [comment])

        return fullComment[0]
    }

    static async setUpvoted(req: Request, res: Response) {
        let comment: Comment;

        try {
            await Car.findOneOrFail(req.params.carId)
            comment = await Comment.findOneOrFail(req.params.commentId)
        } catch (error) {
            res.status(404).send('car or comment not found')
            return
        }

        try {
            // @ts-ignore
            await comment.tryToAddVote(User.getAuthenticatedUser(req))
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        const fullComment = await checkUserActions(User.getAuthenticatedUser(req), [comment])

        res.status(200).send(fullComment[0])
    }

    static async _setInappropriate(params) {
        const { carId, commentId, user } = params

        let comment: Comment;

        try {
            await Car.findOneOrFail(carId)
            comment = await Comment.findOneOrFail(commentId)
        } catch (error) {
            throw new Error('car or comment not found')
        }

        try {
            // @ts-ignore
            await comment.tryToAddInappropriate(user)
        } catch (e) {
            throw new Error('bad request')
        }

        const fullComment = await checkUserActions(user, [comment])

        return fullComment[0]
    }

    static async setInappropriate(req: Request, res: Response) {
        let comment: Comment;

        try {
            await Car.findOneOrFail(req.params.carId)
            comment = await Comment.findOneOrFail(req.params.commentId)
        } catch (error) {
            res.status(404).send('car or comment not found')
            return
        }

        try {
            // @ts-ignore
            await comment.tryToAddInappropriate(User.getAuthenticatedUser(req))
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        const fullComment = await checkUserActions(User.getAuthenticatedUser(req), [comment])

        res.status(200).send(fullComment[0])
    }

    public static async createNewCommentNotifications(car: Car, comment: Comment) {
        const cars = await CarWatched.createQueryBuilder('wcar')
            .where('wcar.car_id = :carId', { carId: car.id })
            .leftJoinAndSelect('wcar.user', 'user')
            .leftJoinAndSelect('wcar.car', 'car')
            .leftJoinAndSelect('car.owner', 'owner')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .leftJoinAndSelect('car.bids', 'bids')
            .andWhere('user.notify_new_comment_in_watch_list = 1')
            .getMany()

        const noitifications: UserNotificationHistory[] = []

        for (const car of cars) {
            const notificationContent = createNewCommentNotificationContent(car.car)
            const n = await UserNotificationHistory.addNotification(
                car.user,
                car.car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.NEW_COMMENT,
                comment
            )

            if (n) {
                noitifications.push(n)
            }
        }

        const notificationContent = createNewCommentNotificationContent(car)
        const sellerNotification = await UserNotificationHistory.addNotification(
            car.owner,
            car,
            notificationContent.content,
            notificationContent.url,
            NotificationTypes.NEW_COMMENT,
            comment
        )
        if (sellerNotification) {
            noitifications.push(sellerNotification)
        }

        await UserNotificationHistory.save(noitifications)
    }

    public static async createRepliedCommentNotifications(car: Car, comment: Comment) {
        const cars = await CarWatched.createQueryBuilder('wcar')
            .where('wcar.car_id = :carId', { carId: car.id })
            .leftJoinAndSelect('wcar.user', 'user')
            .leftJoinAndSelect('wcar.car', 'car')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .leftJoinAndSelect('car.bids', 'bids')
            .andWhere('user.notify_when_someone_replies_in_comment = 1')
            .getMany()

        const noitifications: UserNotificationHistory[] = []

        for (const car of cars) {
            const notificationContent = createReplyCommentNotificationContent(car.car, comment.user)
            const n = await UserNotificationHistory.addNotification(
                car.user,
                car.car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.REPLIED_COMMENT,
                comment
            )

            if (n) {
                noitifications.push(n)
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async _addComment(params) {
        const { isBid, comment, replyTo, car, user } = params

        if (!comment || comment.length === 0) {
            throw new Error('bad request')
        }

        const newComment = new Comment()
        newComment.comment = comment
        newComment.car = car
        newComment.user = user
        newComment.isBid = isBid

        if (car.ownerId === user.id) {
            newComment.seller = true
        }

        if (replyTo) {
            let replyComment: Comment;

            try {
                replyComment = await Comment.findOneOrFail(replyTo)
            } catch {
                throw new Error('comment not found')
            }

            newComment.replyToComment = replyComment
        }

        try {
            await newComment.save()
        } catch (e) {
            throw new Error('bad request')
        }

        const fullComment = await checkUserActions(user, [newComment])

        try {
            if (replyTo && !newComment.isBid) {
                this.createRepliedCommentNotifications(car, newComment)
            } else if (!newComment.isBid) {
                this.createNewCommentNotifications(car, newComment)
            }
        } catch (error) {}

        return fullComment[0]
    }

    static async addComment(req: Request, res: Response) {
        const comment = req.query.comment as string,
              replyTo = req.query.replyTo as string // TODO: check typescript string parsing

        if (!comment || comment.length === 0) {
            res.status(400).send('bad request')
            return
        }

        let car: Car;

        try {
            car = await Car.findOneOrFail(req.params.carId)
        } catch {
            res.status(404).send('car not found')
            return
        }

        const user = User.getAuthenticatedUser(req)

        const newComment = new Comment()
        newComment.comment = comment
        newComment.car = car
        // @ts-ignore
        newComment.user = user


        if (car.ownerId === user?.id) {
            newComment.seller = true
        }

        if (replyTo) {
            let replyComment: Comment;

            try {
                replyComment = await Comment.findOneOrFail(replyTo)
            } catch {
                res.status(404).send('comment not found')
                return
            }

            newComment.replyToComment = replyComment
        }

        try {
            await newComment.save()
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        const fullComment = await checkUserActions(User.getAuthenticatedUser(req), [newComment])

        try {
            if (replyTo) {
                this.createRepliedCommentNotifications(car, newComment)
            } else {
                this.createNewCommentNotifications(car, newComment)
            }
        } catch (error) {}


        res.send(fullComment[0])
    }

    static async _editComment(params) {
        const { comment: commentText, carId, commentId, user } = params

        if (!commentText || commentText.length === 0) {
            throw new Error('bad request')
        }

        let comment: Comment;

        try {
            await Car.findOneOrFail(carId)
            comment = await Comment.findOneOrFail({
                where: {
                    id: commentId,
                    user
                }
            })
        } catch {
            throw new Error('car or comment not found')
        }

        comment.comment = commentText
        comment.edited = true

        try {
            await comment.save()
        } catch (e) {
            throw new Error('bad request')
        }

        const fullComment = await checkUserActions(user, [comment])

        return fullComment[0]
    }

    static async editComment(req: Request, res: Response) {
        const commentText = req.query.comment as string

        if (!commentText || commentText.length === 0) {
            res.status(400).send('bad request')
            return
        }

        let comment: Comment;

        try {
            await Car.findOneOrFail(req.params.carId)
            comment = await Comment.findOneOrFail({
                where: {
                    id: req.params.commentId,
                    user: User.getAuthenticatedUser(req)
                }
            })
        } catch {
            res.status(404).send('car or comment not found')
            return
        }

        comment.comment = commentText
        comment.edited = true

        try {
            await comment.save()
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        const fullComment = await checkUserActions(User.getAuthenticatedUser(req), [comment])

        res.send(fullComment[0])
    }
}

export default CommentController;
