import { Request, Response } from 'express'
import { User } from '../models/User'
import { UserAccessToken } from '../models/UserAccessToken'
import { UserVerification } from '../models/UserVerification'
import { UserPasswordRecovery } from '../models/UserPasswordRecovery'
import { Mail } from '../helpers/Mail'
import { GetUserResetingPasswordEmailTemplate, GetUserVerificationEmailTemplate } from '../helpers/GetEmailTemlate'
import moment from 'moment'
import { getConnection } from 'typeorm'
import { ErrorSignInUsernameNotFound, ErrorUsernameAlreadyExist, ErrorUserNotFound } from '../dictionaries/validation/UsernameErrors'
import { ErrorEmailAlreadyExist, ErrorEmailNotFound, ErrorEmailAlreadySubscribed } from '../dictionaries/validation/EmailErrors'
import { ErrorPasswordDoesntMatch, ErrorSignInPasswordDoesntMatch } from '../dictionaries/validation/PasswordErrors'
import { ErrorUserNotVerified } from '../dictionaries/validation/UserVerificationErrors'
import { ErrorTokenNotFound, ErrorTokenNotVerified } from '../dictionaries/validation/RecaptchaErrors'
import { Stripe } from '../helpers/Stripe'
import { Subscriber } from '../models/Subscriber'
import { ErrorUserAccessDenied } from '../dictionaries/validation/UserRole'
import { UserRole } from '../dictionaries/user/UserRole'
const { v4 } = require('uuid')
import verifyRecaptcha from '../helpers/Recaptcha'

class UserController {
    static userGetParams = [
        'username',
        'verified',
        'reputation',
        'bio',
        'avatar',
        'createdAt',
    ]

    static userUpdateParams = [
        'email',
        'bio',
        'username',
        'zip',
        'phoneNumber',
        'role',

        'sendDailyEmail',
        'sendWeekReviewEmail',
        'notifyWhenMentionedComment',
        'notifyWhenSomeoneRepliesInComment',
        'playSoundWhenBidsPlaced',
        'notifyBeforeAuctionEndsInWatchList',
        'notifyNewBidsInWatchList',
        'notifyNewCommentInWatchList',
        'notifyWhenQuestionAnsweredInWatchList',
        'notifyAuctionResultsInWatchList',
        'sendWatchListNotificationViaEmail',
        'sendNewCommentsViaEmail',
        'sendNewBidsViaEmail'
    ]

    static userCreateParams = [
        'email',
        'username',
        'phoneNumber',
        'password',
        'role',
        'bio'
    ]

    static async getUser(req: Request, res: Response) {
        res.status(200).send(await User.getAuthenticatedUser(req))
    }

    static async getUserOverviewInfo(req: Request, res: Response) {
        if (!req.params.username) {
            return res.status(400).json(new ErrorSignInUsernameNotFound())
        }

        try {
            const user = await User.createQueryBuilder('user')
                .where('user.email = :username OR user.username = :username', { username: req.params.username })
                .select(UserController.userGetParams.map(p => `user.${p}`))
                .getOne()

            return res.status(200).send(user)
        } catch (error) {
            return res.status(404).json(new ErrorUserNotFound())
        }
    }

    static async login(req: Request, res: Response) {
        if (!req.body.hasOwnProperty('login') || !req.body.hasOwnProperty('password')) {
            return res.status(400).send('login or password is empty')
        }

        const user = await User.createQueryBuilder('user')
            .where('user.email = :login OR user.username = :login', { login: req.body.login })
            .getOne()

        if (!user) {
            return res.status(400).send(new ErrorSignInUsernameNotFound())
        }

        if (!await user.checkPassword(req.body.password)) {
            return res.status(401).send(new ErrorSignInPasswordDoesntMatch())
        }

        if (!user.verified) {
            if (req.query.isAdmin && user.allowAdminPanel) {
                UserController._resendVerificationUser({ email: user.email })
            }
            return res.status(401).json(new ErrorUserNotVerified(user))
        }

        if (req.query.isAdmin && !user.allowAdminPanel) {
            return res.status(401).json(new ErrorUserAccessDenied())
        }

        res.status(200).json(await UserAccessToken.createAccessToken(user))
    }

    static async postUser(req: Request, res: Response) {
        const token = req.body.token as string
        if (!token) {
            return res.status(400).send(new ErrorTokenNotFound())
        }

        try {
            await verifyRecaptcha(token)
        } catch (error) {
            return res.status(400).json(new ErrorTokenNotVerified())
        }

        if (req.body.hasOwnProperty('email') && req.body.hasOwnProperty('username')) {
            let existUser = await User.createQueryBuilder('user')
                .where('user.email = :email OR user.username = :username', { username: req.body.username, email: req.body.email })
                .getOne()

            if (existUser && existUser.email === req.body.email) {
                return res.status(400).json(new ErrorEmailAlreadyExist())
            } else if (existUser && existUser?.username === req.body.username) {
                return res.status(400).json(new ErrorUsernameAlreadyExist())
            }

        }

        if (req.body.hasOwnProperty('password')) {
            const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$')
            const match = req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            if (!match) {
                return res.status(400).json(new ErrorPasswordDoesntMatch())
            }
        }

        let user = new User

        for (const val of UserController.userCreateParams) {
            if (req.body.hasOwnProperty(val)) {
                if (val === 'password') {
                    // @ts-ignore
                    await user.setPassword(req.body[val])
                } else if (val === 'role') {
                    const currentUser = User.getAuthenticatedUser(req)
                    if (!currentUser) continue

                    switch (req.body[val]) {
                        case UserRole.RoleSuperAdmin:
                            if (currentUser.role > UserRole.RoleSuperAdmin) break
                            user[val] = UserRole.RoleSuperAdmin
                            break
                        case UserRole.RoleAdmin:
                            if (currentUser.role > UserRole.RoleAdmin) break
                            user[val] = UserRole.RoleAdmin
                            break
                    }
                } else {
                    // @ts-ignore
                    user[val] = req.body[val]
                }
            }
        }

        user.verified = false
        await user.save()

        if (req.body.subscribeToDailyMail) {
            try {
                await Subscriber.addNewSubscriber(req.body.email)
            } catch (error) {
                console.log(error)
            }
        }

        let verification = await UserVerification.createEntity(user)

        Mail.send(
            user.email,
            'Email verification',
            GetUserVerificationEmailTemplate(`${process.env.ORIGIN}/account/verify/${verification?.token}`, user.username || ''),
            true
        )

        return res.status(200).json(await UserAccessToken.createAccessToken(user))
    }

    static async verifyUser(req: Request, res: Response) {
        if (!req.body.hasOwnProperty('token')) {
            res.status(400).send('bad request')
            return
        }

        let token = await UserVerification.createQueryBuilder('verification')
            .where('verification.token = :token', { token: req.body.token })
            .getOne()

        if (!token) {
            res.status(404).send('token not found')
            return
        } else if (!moment(token.expire).isAfter(moment())) {
            res.status(400).send('token expired')
            await token.remove()
            return
        }

        const user = await User.createQueryBuilder('user')
            .where('user.id = :id', { id: token.userId })
            .getOne()

        if (!user) {
            res.status(404).send('user not found')
            return
        }

        user.verified = true
        await user.save()
        await token.remove()

        return res.status(200).json(await UserAccessToken.createAccessToken(user))
    }

    static async _resendVerificationUser({ email }) {
        let user = await User.findOne({
            where: {
                email: email
            }
        })

        if (!user || user.verified) {
            return
        }

        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(UserVerification)
            .where('userId = :id', { id: user.id })
            .execute()

        let verification = await UserVerification.createEntity(user)

        Mail.send(
            user.email,
            'Email verification',
            GetUserVerificationEmailTemplate(`${process.env.ORIGIN}/account/verify/${verification?.token}`, user.username || ''),
            true
        )
    }

    static async resendVerificationUser(req: Request, res: Response) {
        let user = await User.findOne({
            where: {
                email: req.query.email
            }
        })

        if (!user || user.verified) {
            res.status(400).send('already verified')
            return
        }

        const previousToken = await UserVerification
            .createQueryBuilder('user_verification')
            .select([
                'user_verification.id',
                'user_verification.userId',
                'user_verification.expire'
            ])
            .where('user_verification.userId = :id', { id: user.id })
            .getOne()


        if (previousToken) {
            const timeDiff = moment(previousToken.expire).diff(moment(), 'second')
            // resend the e-mail only after 60 seconds have passed
            if (previousToken && timeDiff > (24 * 60 - 1) * 60) {
                return res.status(200).send('already sended')
            }
            await previousToken.remove()
        }

        // await getConnection()
        //     .createQueryBuilder()
        //     .delete()
        //     .from(UserVerification)
        //     .where('userId = :id', { id: user.id })
        //     .execute()

        let verification = await UserVerification.createEntity(user)

        Mail.send(
            user.email,
            'Email verification',
            GetUserVerificationEmailTemplate(`${process.env.ORIGIN}/account/verify/${verification?.token}`, user.username || ''),
            true
        )

        res.status(200).send('sended')
    }

    static async passwordRecoverySend(req: Request, res: Response) {
        if (!req.body.hasOwnProperty('email')) {
            res.status(400).json(new ErrorEmailNotFound())
            return
        }

        const user = await User.createQueryBuilder('user')
            .where('user.email = :email', { email: req.body.email })
            .getOne()

        if (!user) {
            res.status(404).send(new ErrorEmailNotFound())
            return
        }

        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(UserPasswordRecovery)
            .where('userId = :id', { id: user.id })
            .execute()

        let passwordRecovery = await UserPasswordRecovery.createEntity(user)

        Mail.send(
            user.email,
            'Password recovery',
            GetUserResetingPasswordEmailTemplate(`${process.env.ORIGIN}/account/reset-password/${passwordRecovery?.token}`, user.username || ''),
            true
        )

        res.status(200).send('sended')
    }

    static async passwordRecoveryCheck(req: Request, res: Response) {
        if (!req.body.hasOwnProperty('token')) {
            res.status(400).send('bad request')
            return
        }

        let token = await UserPasswordRecovery.createQueryBuilder('recovery')
            .where('recovery.token = :token', { token: req.body.token })
            .getOne()

        if (!token) {
            res.status(404).send('token not found')
            return
        } else if (!moment(token.expire).isAfter(moment())) {
            res.status(400).send('token expired')
            await token.remove()
            return
        }

        const user = await User.createQueryBuilder('user')
            .where('user.id = :id', { id: token.userId })
            .getOne()

        if (!user) {
            res.status(404).send('user not found')
            return
        }

        res.status(200).send('verified')
    }

    static async passwordRecoveryUpdatePassword(req: Request, res: Response) {
        if (!req.body.hasOwnProperty('token') || !req.body.hasOwnProperty('password')) {
            res.status(400).send('bad request')
            return
        }

        let token = await UserPasswordRecovery.createQueryBuilder('recovery')
            .where('recovery.token = :token', { token: req.body.token })
            .getOne()

        if (!token) {
            return res.status(404).send('token not found')

        } else if (!moment(token.expire).isAfter(moment())) {
            await token.remove()
            return res.status(400).send('token expired')
        }

        const user = await User.createQueryBuilder('user')
            .where('user.id = :id', { id: token.userId })
            .getOne()

        if (!user) {
            return res.status(404).send('user not found')
        }

        const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$')
        const match = req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
        if (!match) {
            return res.status(400).json(new ErrorPasswordDoesntMatch())
        }

        await user.setPassword(req.body.password)
        await user.save()
        await token.remove()

        res.status(200).send('password changed')
    }

    static async putUser(req: Request, res: Response) {
        let user = req.query.toUserId
            ? await User.findOne(req.query.toUserId as string) || null
            : User.getAuthenticatedUser(req)

        const currentUser = User.getAuthenticatedUser(req)

        if (!user || !currentUser) return res.status(404).send(new ErrorUserNotFound())

        if (currentUser.id !== user.id) {
            if (!currentUser.allowAdminPanel) {
                return res.status(404).send(new ErrorUserAccessDenied())
            }
        }

        for (const val of UserController.userUpdateParams) {
            if (req.body.hasOwnProperty(val)) {
                if (val === 'role') {
                    switch (req.body[val]) {
                        case UserRole.RoleSuperAdmin:
                            if (currentUser.role > UserRole.RoleSuperAdmin) break
                            user[val] = UserRole.RoleSuperAdmin
                            break
                        case UserRole.RoleAdmin:
                            if (currentUser.role > UserRole.RoleAdmin) break
                            user[val] = UserRole.RoleAdmin
                            break
                    }
                } else if (val) {
                    user[val] = req.body[val]
                }
            }
        }

        if (req.query.toUserId && req.body.hasOwnProperty('password')) {
            await user.setPassword(req.body.password)
        }

        await user?.save()

        res.status(204).send('user updated')
    }

    static async changePassword(req: Request, res: Response) {
        const user = User.getAuthenticatedUser(req)
        if (!user) return res.status(400).send('bad request')

        if (!await user.checkPassword(req.body.password)) {
            return res.status(400).json(new ErrorSignInPasswordDoesntMatch())
        }

        if (req.body.hasOwnProperty('newPassword')) {
            const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$')
            const match = req.body.newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            if (!match) {
                return res.status(400).json(new ErrorPasswordDoesntMatch())
            }
        } else {
            return res.status(400).send('bad request')
        }

        await user.setPassword(req.body.newPassword)
        await user.save()

        res.status(200).send('password changed')
    }

    static async uploadAvatar(req: Request, res: Response) {
        let user = User.getAuthenticatedUser(req)

        if (req.query.toUserId) {
            user = await User.findOne(req.query.toUserId as string) || null
        }

        if (!user) return res.status(404).send(new ErrorUserNotFound())

        try {
            // @ts-ignore
            if (req.files['avatar'][0]) {
                // @ts-ignore
                const avatar = req.files['avatar'][0];
                await user?.uploadAvatar(avatar.path, 'uploads/user/' + v4() + '-' + avatar.originalname)
                await user?.save()
            }
        } catch (err) {
            return res.status(400).send('cant upload avatar')
        }

        return res.status(204).send('avatar uploaded')
    }

    static async saveUserPaymentCard(req: Request, res: Response) {
        if (!req.body.paymentMethod) {
            return res.status(400).send('bad request')
        }

        let user = User.getAuthenticatedUser(req)
        let customer, cardData;

        try {
            customer = await Stripe.createCustomer(req.body.paymentMethod)
            const m = await Stripe.retrievePaymentMethod(req.body.paymentMethod)
            cardData = m.card
        } catch (error) {
            return res.status(error.statusCode).send(error.message)
        }

        try {
            // @ts-ignore
            user.stripeCustomerId = customer.id
            // @ts-ignore
            user.stripePaymentMethodId = req.body.paymentMethod
            // @ts-ignore
            user.phoneNumber = req.body.phoneNumber
            // @ts-ignore
            user.stripeLast4 = cardData && cardData.last4
            user?.save()
            return res.status(200).send('success')
        } catch (error) {
            return res.status(400).send(error)
        }

    }

    static async updateUserPaymentCard(req: Request, res: Response) {
        const { paymentMethod, phoneNumber } = req.body

        if (!paymentMethod && !phoneNumber) {
            return res.status(400).send('bad request')
        }

        let user = User.getAuthenticatedUser(req)

        if (!user) {
            return res.status(400).send('bad request')
        }

        if (phoneNumber) {
            user.phoneNumber = phoneNumber as string
            await user?.save()
        }

        if (paymentMethod) {
            let newPaymentMethod

            try {
                newPaymentMethod = await Stripe.updateCustomer(paymentMethod, user?.stripeCustomerId || '')
                const m = await Stripe.retrievePaymentMethod(req.body.paymentMethod)
                user.stripeLast4 = m.card && m.card.last4
            } catch (error) {
                return res.status(error.statusCode).send(error.raw.message)
            }

            try {
                user.stripePaymentMethodId = newPaymentMethod.id
                await user.save()
            } catch (error) {
                return res.status(400).send(error)
            }
        }

        return res.status(200).send('success')
    }

    static async subscribeUser(req: Request, res: Response) {
        const { email } = req.body

        if (!email) {
            return res.status(400).send('bad request')
        }

        try {
            await Subscriber.addNewSubscriber(email)
        } catch (error) {
            return res.status(400).send(new ErrorEmailAlreadySubscribed())
        }

        return res.status(200).send('subscribed')
    }

    static async getUsersAvatar(req: Request, res: Response) {
        if (!req.body.usernames ||
            !Array.isArray(req.body.usernames) ||
            req.body.usernames.length === 0) return res.status(400).send('bad request')

        const users = await User.createQueryBuilder('u')
            .where('u.username IN (:...names)', { names: req.body.usernames })
            .getMany()

        const usernames = users.map(u => ({
            username: u.username,
            avatart: u.avatar
        }))

        return res.status(200).send(usernames)
    }
}

export default UserController;
