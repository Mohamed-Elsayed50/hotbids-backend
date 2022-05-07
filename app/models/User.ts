import { Request } from 'express';
import * as argon2 from "argon2";
import moment from "moment";
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, BeforeInsert, SelectQueryBuilder } from "typeorm";
import { Bid } from "./Bid";
import { Car } from "./Car";
import { CarWatched } from "./CarWatched";
import { Comment } from "./Comment";
import { CommentInappropriate } from "./CommentInappropriate";
import { CommentLike } from "./CommentLike";
import { Question } from "./Question";
import { QuestionInappropriate } from "./QuestionInappropriate";
import { QuestionLike } from "./QuestionLike";
import { UserAccessToken } from "./UserAccessToken";
import { UserBilling } from "./UserBilling";
import { UserNotification } from "./UserNotification";
import { UserNotificationHistory } from "./UserNotificationHistory";
import { UserPasswordRecovery } from "./UserPasswordRecovery";
import { UserVerification } from "./UserVerification";
import { Files } from "../helpers/Files";
import { UserRole } from '../dictionaries/user/UserRole';
import { CarImage } from './CarImage';
const bcrypt = require('bcryptjs');
const md5 = require('md5');

@Entity("user", { schema: "bids" })
@Unique(["email", "username"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("varchar", { name: "email", nullable: true, length: 255 })
    email: string | null;

    @Column("varchar", { name: "username", nullable: true, length: 255 })
    username: string | null;

    @Column("varchar", { name: "password", nullable: true, length: 255 })
    password: string | null;

    @Column('tinyint', { name: "role", width: 1, default: UserRole.RoleUser })
    role: UserRole;

    @Column("varchar", { name: "avatar", nullable: true, length: 255 })
    avatar: string | null;

    @Column("varchar", { name: "phone_number", nullable: true, length: 255 })
    phoneNumber: string | null;

    @Column("tinyint", { name: "verified", nullable: true, width: 1 })
    verified: boolean | null;

    @Column("int", { name: "reputation", nullable: true })
    reputation: number | null;

    @Column("varchar", { name: "bio", nullable: true, length: 255 })
    bio: string | null;

    @Column("varchar", { name: "stripe_customer_id", nullable: true, length: 255 })
    stripeCustomerId: string | null;

    @Column("varchar", { name: "stripe_payment_method_id", nullable: true, length: 255 })
    stripePaymentMethodId: string | null;

    @Column("varchar", { name: "stripe_last_4", nullable: true, length: 8 })
    stripeLast4: string | null;

    @Column("tinyint", { name: "send_daily_email", nullable: true, width: 1, default: 1 })
    sendDailyEmail: boolean | null;

    @Column("tinyint", { name: "send_week_review_email", nullable: true, width: 1 })
    sendWeekReviewEmail: boolean | null;

    @Column("tinyint", { name: "notify_when_mentioned_comment", nullable: true, width: 1, default: 1 })
    notifyWhenMentionedComment: boolean | null;

    @Column("tinyint", { name: "notify_when_someone_replies_in_comment", nullable: true, width: 1, default: 1 })
    notifyWhenSomeoneRepliesInComment: boolean | null;

    @Column("tinyint", { name: "play_sound_when_bids_placed", nullable: true, width: 1, default: 1 })
    playSoundWhenBidsPlaced: boolean | null;

    @Column("tinyint", { name: "notify_before_auction_ends_in_watch_list", nullable: true, width: 1, default: 1 })
    notifyBeforeAuctionEndsInWatchList: boolean | null;

    @Column("tinyint", { name: "notify_new_bids_in_watch_list", nullable: true, width: 1, default: 1 })
    notifyNewBidsInWatchList: boolean | null;

    @Column("tinyint", { name: "notify_new_comment_in_watch_list", nullable: true, width: 1, default: 1 })
    notifyNewCommentInWatchList: boolean | null;

    @Column("tinyint", { name: "notify_when_question_answered_in_watch_list", nullable: true, width: 1, default: 1 })
    notifyWhenQuestionAnsweredInWatchList: boolean | null;

    @Column("tinyint", { name: "notify_auction_results_in_watch_list", nullable: true, width: 1, default: 1 })
    notifyAuctionResultsInWatchList: boolean | null;

    @Column("tinyint", { name: "send_watch_list_notification_via_email", nullable: true, width: 1, default: 1 })
    sendWatchListNotificationViaEmail: boolean | null;

    @Column("tinyint", { name: "send_new_comments_via_email", nullable: true, width: 1, default: 1 })
    sendNewCommentsViaEmail: boolean | null;

    @Column("tinyint", { name: "send_new_bids_via_email", nullable: true, width: 1, default: 1 })
    sendNewBidsViaEmail: boolean | null;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @OneToMany(() => Bid, (bid) => bid.user)
    bids: Bid[];

    @OneToMany(() => Car, (car) => car.owner)
    cars: Car[];

    @OneToMany(() => Car, (car) => car.verifiedBy)
    verifiedCars: Car[];

    @OneToMany(() => CarWatched, (carWatched) => carWatched.user)
    carWatcheds: CarWatched[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(
        () => CommentInappropriate,
        (commentInappropriate) => commentInappropriate.user
    )
    commentInappropriates: CommentInappropriate[];

    @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
    commentLikes: CommentLike[];

    @OneToMany(() => Question, (question) => question.user)
    questions: Question[];

    @OneToMany(
        () => QuestionInappropriate,
        (questionInappropriate) => questionInappropriate.user
    )
    questionInappropriates: QuestionInappropriate[];

    @OneToMany(() => QuestionLike, (questionLike) => questionLike.user)
    questionLikes: QuestionLike[];

    @OneToMany(() => UserAccessToken, (userAccessToken) => userAccessToken.user)
    userAccessTokens: UserAccessToken[];

    @OneToMany(() => UserPasswordRecovery, (userPasswordRecovery) => userPasswordRecovery.user)
    userPasswordRecovery: UserPasswordRecovery[];

    @OneToMany(() => UserVerification, (userVerification) => userVerification.user)
    userVerification: UserVerification[];

    @OneToMany(() => UserBilling, (userBilling) => userBilling.user)
    userBillings: UserBilling[];

    @OneToOne(
        () => UserNotification,
        (userNotification) => userNotification.user
    )
    userNotification: UserNotification;

    @OneToMany(
        () => UserNotificationHistory,
        (userNotificationHistory) => userNotificationHistory.user
    )
    userNotificationHistories: UserNotificationHistory[];

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate()
    }

    get isAdmin() {
        return this.role === UserRole.RoleAdmin
    }

    get isSuperAdmin() {
        return this.role === UserRole.RoleSuperAdmin
    }

    get allowAdminPanel() {
        return this.isAdmin || this.isSuperAdmin
    }

    async setPassword(password: string) {
        this.password = await argon2.hash(md5(password), {
            type: argon2.argon2id,
            timeCost: 6,
            memoryCost: 65536,
            parallelism: 1
        });
        //this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        return this;
    }

    async checkPassword(password: string) {
        if (this.password?.indexOf('$argon') === 0) {
            return await argon2.verify(this.password, md5(password))
        }
        return bcrypt.compareSync(password, this.password);
    }

    static setAuthenticatedUser(req: Request, user: User | null) {
        // @ts-ignore
        req.authenticatedUser = user;
    }

    static getAuthenticatedUser(req: Request): User | null {
        // @ts-ignore
        return req.authenticatedUser;
    }

    static hasAuthenticatedUser(req: Request): boolean {
        // @ts-ignore
        return req.authenticatedUser != null;
    }

    async uploadAvatar(oldPath, path) {
        let url = await Files.upload(oldPath, path)

        if (!url)
            return false

        this.avatar = url

        return true
    }

    static async getTodayRegisteredUsersCount() {
        const startDate = moment().startOf('day').toDate()
        const endDate = moment().endOf('day').toDate()

        return await User.createQueryBuilder('user')
            .where('user.createdAt >= :startDate AND user.createdAt <= :endDate', {
                startDate,
                endDate
            })
            .getCount()
    }

    static async deleteUser(userId: any) {
        const result = {
            success: true
        }

        try {
            await User.delete(userId)
        } catch (error) {
            result.success = false
        }

        return result
    }

    static async deleteUsers(users: any[], lastUsers: any[]) {
        const result = {
            success: true,
            usersCount: 0,
            appendedUsers: [],
            deletedUsers: []
        } as { appendedUsers: any[], deletedUsers: any[], [key: string]: any }

        for (const user of Object.values(users)) {
            try {
                await User.deleteUser(user)
                result.deletedUsers.push({ id: user })
            } catch (error) {
                console.log('ERROR DELETING USER', error)
                result.success = false
            }
        }

        if (result.deletedUsers.length > 0 && lastUsers && lastUsers.length > 0) {
            const lastUser = [...lastUsers].pop()
            const isManager = lastUser.role === UserRole.RoleAdmin || lastUser.role === UserRole.RoleSuperAdmin
            let usersQuery: SelectQueryBuilder<User>
            if (!isManager) {
                usersQuery = User.getUserManagerQuery()
            } else {
                usersQuery = User.createQueryBuilder('user')
                    .where('user.role < :role', { role: UserRole.RoleUser })
                    .addOrderBy('user.createdAt', 'DESC')
            }
            const lastDate = moment.utc(lastUser.created_at).local().format('YYYY-MM-DD HH:mm:ss')
            const appendQuery = usersQuery.clone()
                .andWhere('user.createdAt <= :lastDate', { lastDate })
                .andWhere('user.id NOT IN (:...ids)', { ids: lastUsers.map(u => u.id) })
                .take(result.deletedUsers.length)
            const appendedUsers = !isManager ? await appendQuery.getRawMany() : await appendQuery.getMany()
            const count = await usersQuery.getCount()

            result.usersCount = count
            result.appendedUsers = appendedUsers.slice(0, result.deletedUsers.length)
        }

        return result
    }

    static async getByIdAndToken(id: number, token: string): Promise<User | undefined> {
        return await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.userAccessTokens', 'userAccessToken')
            .where('user.id = :id AND userAccessToken.token = :token', {
                id: id,
                token: token
            })
            .getOne()
    }

    static async getByToken(token: string) {
        return await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.userAccessTokens', 'userAccessToken')
            .where('userAccessToken.token = :token', {
                token: token
            })
            .getOne()
    }

    static async getManagers() {
        return await User.createQueryBuilder('user')
            .where('user.role = :admin OR user.role = :superAdmin', {
                admin: UserRole.RoleAdmin,
                superAdmin: UserRole.RoleSuperAdmin
            })
            .getMany()
    }

    static getUserManagerQuery(carOrder: 'ASC' | 'DESC' = 'ASC') {
        return User.createQueryBuilder('user')
            .where('user.role = :role', { role: UserRole.RoleUser })
            .leftJoinAndSelect(query => query
                .from(Car, 'car')
                .select([
                    'car.id as last_car_id',
                    'car.title as last_car_title',
                    'car.end_date as car_end_date',
                    'car.start_date as last_car_start_date',
                    'car.owner_id',
                    'car.verification_state as car_verification_state',
                    'car.verified as car_verified'
                ])
                .addSelect('MAX(car.end_date)', 'last_car_end_date')
                .addSelect('MAX(car.start_date)', 'car_start_date')
                .where('car.verified = 1')
                .leftJoinAndSelect(query => query
                    .from(CarImage, 'carImage')
                    .select(['carImage.url as first_car_image_url, carImage.id, carImage.car_id'])
                    .addSelect('MAX(carImage.id) as first_car_image')
                    .andWhere('carImage.type = :image', { image: CarImage.TYPE_EXTERIOR })
                    .groupBy('carImage.id')
                    .orderBy('carImage.id', 'DESC'),
                    'first_image', 'first_image.car_id = car.id'
                )
                .groupBy('car.id')
                .orderBy('car_start_date', carOrder),
                'last_car', 'last_car.owner_id = user.id')
            .leftJoinAndSelect(query => query
                .from(Comment, 'comment')
                .select(['comment.comment as last_comment, comment.id, comment.user_id as last_comment_user_id'])
                .addSelect('MIN(comment.created_at) as last_comment_date')
                .groupBy('comment.created_at')
                .orderBy('comment.created_at', 'DESC'),
                'last_comment', 'last_comment.last_comment_user_id = user.id'
            )
            .select([
                'user',
                'user.id',
                'last_comment',
                'last_car'
            ])
            .groupBy('user.id,user.username')
            .orderBy('user.createdAt', 'DESC');
    }
}
