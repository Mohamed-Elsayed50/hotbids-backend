import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { Car } from '../models/Car';
import { User } from '../models/User';
import { CarWatched } from '../models/CarWatched';
import { CarImage } from '../models/CarImage';
import { NotificationTypes, UserNotificationHistory } from '../models/UserNotificationHistory';
import { createQuestionAnsweredNotificationContent } from '../dictionaries/notification/QuestionNotification';

class QuestionController {
    static async _getQuestionsByCarId({ carId, skip, take, full = true }) {
        const questionQuery = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.carId = :carId', { carId })
            .andWhere('question.replyToQuestionId IS NULL')
            .orderBy('question.createdAt', 'DESC')
            .skip(skip || 0)
            .take(take || 15);

        if (full) {
            questionQuery
                .leftJoinAndSelect('question.questionLikes', 'questionLikes')
                .leftJoinAndSelect('question.questionInappropriates', 'questionInappropriates')
        }

        const [questions, count] = await questionQuery.getManyAndCount()

        let needCheckReplies = questions
        while (needCheckReplies.length) {
            const repliesQuery = Question.createQueryBuilder('question')
                .leftJoinAndSelect('question.user', 'user')
                .where('question.replyToQuestionId IN (:...ids)', { ids: [...needCheckReplies.map(c => c.id)] })

            if (full) {
                repliesQuery
                    .leftJoinAndSelect('question.questionLikes', 'questionLikes')
                    .leftJoinAndSelect('question.questionInappropriates', 'questionInappropriates')
            }

            const replies = await repliesQuery.getMany()

            needCheckReplies = replies.filter(reply => {
                const exists = questions.find(questions => questions.id === reply.id)
                if (!exists) {
                    questions.push(reply)
                }
                return !exists
            })
        }

        return {
            count,
            questions
        }
    }

    static async _getQuestionByCarId({ carId, questionId = false }) {
        const questionQuery = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.carId = :carId', { carId })
            .orderBy('question.createdAt', 'DESC')
            .leftJoinAndSelect('question.questionLikes', 'questionLikes')
            .leftJoinAndSelect('question.questionInappropriates', 'questionInappropriates')

        if (questionId) {
            questionQuery.andWhere('question.id = :questionId', { questionId })
        }

        const question = await questionQuery.getOne()

        return question
    }

    static async getQuestionsByCarId(req: Request, res: Response) {
        const { questions } = await QuestionController._getQuestionsByCarId({
            carId: req.params.carId,
            skip: req.query.skip && Number(req.query.skip),
            take: req.query.skip && Number(req.query.take),
            full: User.hasAuthenticatedUser(req)
        })

        if (questions.length === 0) {
            res.status(404).send("car or questions not found")
            return
        }

        res.send({
            count: questions.length,
            questions
        })
    }

    static async _setUpvoted(params) {
        const { carId, questionId, user } = params

        const questionQuery = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.carId = :carId', { carId })
            .andWhere('question.id = :questionId', { questionId })

        await Car.findOneOrFail(carId)
        const question = await questionQuery.getOne()
        if (!question) return { success: false }
        await question.tryToAddVote(user)

        const fullQuestion = await questionQuery
            .leftJoinAndSelect('question.questionLikes', 'questionLikes')
            .leftJoinAndSelect('question.questionInappropriates', 'questionInappropriates')
            .getOne()

        return fullQuestion
    }

    static async setUpvoted(req: Request, res: Response) {
        let question: Question;

        try {
            await Car.findOneOrFail(req.params.carId)
            question = await Question.findOneOrFail(req.params.questionId)
        } catch (error) {
            res.status(404).send('car or question not found')
            return
        }

        try {
            // @ts-ignore
            question.tryToAddVote(User.getAuthenticatedUser(req))
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        res.status(200).send('question liked or disliked')
    }

    static async _setInappropriate(params) {
        const { carId, questionId, user } = params

        const questionQuery = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.carId = :carId', { carId })
            .andWhere('question.id = :questionId', { questionId })

        await Car.findOneOrFail(carId)
        const question = await questionQuery.getOne()
        if (!question) return { success: false }
        await question.tryToAddInappropriate(user)

        const fullQuestion = await questionQuery
            .leftJoinAndSelect('question.questionLikes', 'questionLikes')
            .leftJoinAndSelect('question.questionInappropriates', 'questionInappropriates')
            .getOne()

        return fullQuestion
    }

    static async setInappropriate(req: Request, res: Response) {
        let question: Question;

        try {
            await Car.findOneOrFail(req.params.carId)
            question = await Question.findOneOrFail(req.params.questionId)
        } catch (error) {
            res.status(404).send('car or question not found')
            return
        }

        try {
            // @ts-ignore
            question.tryToAddInappropriate(User.getAuthenticatedUser(req))
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        res.status(200).send('question inappropriate or disinappropriate')
    }

    public static async createQuestionAnsweredNotifications(car: Car, question: Question) {
        const cars = await CarWatched.createQueryBuilder('wcar')
            .where('wcar.car_id = :carId', { carId: car.id })
            .leftJoinAndSelect('wcar.user', 'user')
            .leftJoinAndSelect('wcar.car', 'car')
            .leftJoinAndSelect('car.carImages', 'carImages', `carImages.type = ${CarImage.TYPE_EXTERIOR}`)
            .leftJoinAndSelect('car.owner', 'owner')
            .andWhere('user.notify_when_someone_replies_in_comment = 1')
            .getMany()

        const noitifications: UserNotificationHistory[] = []

        for (const car of cars) {
            const notificationContent = createQuestionAnsweredNotificationContent(car.car)
            const n = await UserNotificationHistory.addNotification(
                car.user,
                car.car,
                notificationContent.content,
                notificationContent.url,
                NotificationTypes.QUESTION_ANSWERED,
                question
            )

            if (n) {
                noitifications.push(n)
            }
        }

        await UserNotificationHistory.save(noitifications)
    }

    static async _setAnswer(params: { car: Car, carId: any, questionId: any, text: string, user: User }) {
        const { carId, questionId, text, user, car } = params
        let owner: User

        try {
            if (car && car.owner) {
                owner = car.owner
            } else if (car && car.id) {
                owner = await User.findOneOrFail({ where: { id: car.ownerId } })
                if (owner.id !== user.id) {
                    throw new Error('permission denied')
                }

            } else {
                throw new Error('not found user')
            }
        } catch (error) {
            return
        }

        const question = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.id = :questionId', { questionId })
            .orderBy('question.createdAt', 'DESC')
            .getOne();

        if (!question) return { success: false }

        if (!text || text.length === 0) {
            return question
        }

        question.answerIsEdited = Boolean(question.answer && question.answer.length > 0)
        question.answer = text

        await question.save()

        try {
            this.createQuestionAnsweredNotifications(car, question)
        } catch (error) {

        }

        return question
    }

    static async setAnswer(req: Request, res: Response) {
        const answer = req.query.answer as string

        if (!answer || answer.length === 0) {
            res.status(400).send('bad request')
            return
        }

        let question: Question;

        try {
            // Only car owner can set answer to question
            await Car.findOneOrFail({
                where: {
                    id: req.params.carId,
                    owner: User.getAuthenticatedUser(req)
                }
            })

            question = await Question.findOneOrFail({
                where: {
                    id: req.params.questionId,
                }
            })
        } catch (error) {
            res.status(404).send('car or question not found')
            return
        }

        question.answerIsEdited = Boolean(question.answer && question.answer.length > 0)
        question.answer = answer

        try {
            await question.save()
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        res.status(200).send('answer added')
    }

    static async _addQuestion(params) {
        const { carId, text, user, replyTo } = params

        if (!text || text.length === 0) {
            throw new Error()
        }

        let car = await Car.findOneOrFail(carId);

        const newQuestion = new Question()
        newQuestion.question = text
        newQuestion.car = car
        newQuestion.user = user

        if (replyTo) {
            let replyToQuestion: Question

            try {
                replyToQuestion = await Question.findOneOrFail(replyTo)
            } catch (error) {
                throw new Error('question not found')
            }

            newQuestion.replyToQuestion = replyToQuestion
        }

        await newQuestion.save();

        return newQuestion
    }

    static async addQuestion(req: Request, res: Response) {
        const question = req.query.question as string
        const replyTo = req.query.replyTo as string

        if (!question || question.length === 0) {
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

        const newQuestion = new Question()
        newQuestion.question = question
        newQuestion.car = car
        // @ts-ignore
        newQuestion.user = User.getAuthenticatedUser(req)

        if (replyTo) {
            let replyToQuestion: Question

            try {
                replyToQuestion = await Question.findOneOrFail(replyTo)
            } catch (error) {
                res.status(404).send('question not found')
                return
            }

            newQuestion.replyToQuestion = replyToQuestion
        }

        try {
            await newQuestion.save();
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        res.send('question added')
    }

    static async _editQuestion(params) {
        const { carId, questionId, text, user } = params

        if (!text || text.length === 0) {
            throw new Error()
        }

        await Car.findOneOrFail(carId)

        const question = await Question.createQueryBuilder('question')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.id = :questionId', { questionId })
            .orderBy('question.createdAt', 'DESC')
            .getOne();

        if (!question) return { success: false }

        question.question = text
        question.questionIsEdited = true

        await question.save();

        return question
    }

    static async editQuestion(req: Request, res: Response) {
        const questionText = req.query.question as string

        if (!questionText || questionText.length === 0) {
            res.status(400).send('bad request')
            return
        }

        let question: Question;

        try {
            await Car.findOneOrFail(req.params.carId)
            question = await Question.findOneOrFail({
                where: {
                    id: req.params.questionId,
                    user: User.getAuthenticatedUser(req)
                }
            })
        } catch (error) {
            res.status(404).send('car or question not found')
            return
        }

        question.question = questionText
        question.questionIsEdited = true

        try {
            await question.save();
        } catch (e) {
            res.status(400).send('bad request')
            return
        }

        res.send('question changed')
    }
}

export default QuestionController;
