import {
    AfterInsert,
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    getRepository,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Car } from "./Car";
import { User } from "./User";
import { CommentInappropriate } from "./CommentInappropriate";
import { CommentLike } from "./CommentLike";
import moment from "moment";

@Index("comment_to_comment", ["replyToCommentId"], {})
@Index("comment_to_user", ["userId"], {})
@Index("comment_to_car", ["carId"], {})
@Entity("comment", { schema: "bids" })
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("int", { name: "car_id", nullable: true })
    carId: number | null;

    @Column("int", { name: "user_id", nullable: true })
    userId: number | null;

    @Column("text", { name: "comment", nullable: true })
    comment: string | null;

    @Column("tinyint", { name: "seller", nullable: true, width: 1 })
    seller: boolean | null;

    @Column("int", { name: "likes", nullable: true, default: 0 })
    likes: number;

    @Column("int", { name: "inappropriate", nullable: true, default: 0 })
    inappropriate: number;

    @Column("int", { name: "reply_to_comment_id", nullable: true })
    replyToCommentId: number | null;

    @Column("tinyint", { name: "is_bid", nullable: true, width: 1 })
    isBid: boolean | null;

    @Column("tinyint", { name: "edited", nullable: true, width: 1 })
    edited: boolean | null;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @ManyToOne(() => Car, (car) => car.comments, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "car_id", referencedColumnName: "id" }])
    car: Car;

    @ManyToOne(() => Comment, (comment) => comment.comments, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "reply_to_comment_id", referencedColumnName: "id" }])
    replyToComment: Comment;

    @OneToMany(() => Comment, (comment) => comment.replyToComment)
    comments: Comment[];

    @ManyToOne(() => User, (user) => user.comments, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @OneToMany(
        () => CommentInappropriate,
        (commentInappropriate) => commentInappropriate.comment
    )
    commentInappropriates: CommentInappropriate[];

    @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
    commentLikes: CommentLike[];

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate();
    }

    @AfterInsert()
    async updateNotificationHistory() {
        if (this.isBid) return
    }

    /**
     * If comment is already has inappropriate by user then remove inappropriate flag
     */
    async tryToAddInappropriate(user: User) {
        const commentInappropriate = new CommentInappropriate();

        commentInappropriate.comment = this
        commentInappropriate.user = user

        try {
            await commentInappropriate.save()
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                await this.removeInappropriate(user)
                return
            }
        }

        this.inappropriate += 1

        await this.save()
    }

    async removeInappropriate(user: User) {
        this.inappropriate -= 1
        await CommentInappropriate.getRepository().delete({
            commentId: this.id,
            user
        })
        await this.save()
    }

    /**
     * If comment is already has vote from user then remove vote
     */
    async tryToAddVote(user: User) {
        const commentLike = new CommentLike();

        commentLike.comment = this
        commentLike.user = user

        try {
            await commentLike.save()
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                await this.removeVote(user)
                return
            }
        }

        this.likes += 1

        await this.save()
    }

    async removeVote(user: User) {
        this.likes -= 1
        await CommentLike.getRepository().delete({
            commentId: this.id,
            user
        })
        await this.save()
    }

    static async getTodayCommentsCount() {
        const startDate  = moment().startOf('day').toDate()
        const endDate = moment().endOf('day').toDate()

        return await Comment.createQueryBuilder('comment')
            .where('comment.createdAt >= :startDate AND comment.createdAt <= :endDate', {
                startDate,
                endDate
            })
            .getCount()
    }

    static async editComment(commentId: any, commentText: string) {
        try {
            const comment = await Comment.findOneOrFail({ id: commentId })
            comment.comment = commentText
            comment.edited = true

            comment.save()
            return comment
        } catch (error) {
            return { success: false }
        }
    }

    static async deleteComments(comments: any[], lastComments: any[]) {
        const result = {
            success: true,
            commentsCount: 0,
            appendedComments: [],
            deletedComments: []
        } as { appendedComments: any[], deletedComments: any[], [key: string]: any }

        const commentIds = Object.values(comments)

        try {
            await Comment.delete(commentIds)
            result.deletedComments.push(...commentIds.map(c => ({ id: c })))
        } catch (error) {
            console.log(error)
            result.success = false
        }

        if (result.deletedComments.length > 0 && lastComments?.length > 0) {
            const lastComment = [...lastComments].pop()

            const appendedComments = await Comment.getUserManagerQuery()
                .andWhere('comment.createdAt <= :lastDate', { lastDate: moment(lastComment.created_at).format('YYYY-MM-DD hh:mm:ss') })
                .andWhere('comment.id NOT IN (:...ids)', { ids: lastComments.map(c => c.id) })
                .addOrderBy('comment.createdAt', 'DESC')
                .take(result.deletedComments.length)
                .getMany()

            const count = await Comment.getUserManagerQuery().getCount()

            result.commentsCount = count
            result.appendedComments = appendedComments.slice(0, result.deletedComments.length)
        }

        return result
    }

    static getUserManagerQuery() {
        return Comment.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('(comment.isBid = 0 OR comment.isBid IS NULL)')
            .orderBy('comment.createdAt', 'DESC')
    }

    static async getCommentWithUser(id) {
        return await Comment.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('(comment.isBid = 0 OR comment.isBid IS NULL)')
            .andWhere('comment.id = :id', { id })
            .getOneOrFail()
    }
}
