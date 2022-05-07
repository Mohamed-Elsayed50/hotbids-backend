import {
    BaseEntity, BeforeInsert,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Car } from "./Car";
import { User } from "./User";
import { QuestionInappropriate } from "./QuestionInappropriate";
import { QuestionLike } from "./QuestionLike";
import moment from "moment";

@Index("question_to_user", ["userId"], {})
@Index("question_to_car", ["carId"], {})
@Entity("question", { schema: "bids" })
export class Question extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("int", { name: "car_id", nullable: true })
    carId: number | null;

    @Column("int", { name: "user_id", nullable: true })
    userId: number | null;

    @Column("text", { name: "question" })
    question: string;

    @Column("text", { name: "answer", nullable: true })
    answer: string | null;

    @Column("int", { name: "likes", default: 0 })
    likes: number;

    @Column("int", { name: "inappropriate", default: 0 })
    inappropriate: number;

    @Column("tinyint", { name: "question_is_edited", nullable: true, width: 1 })
    questionIsEdited: boolean | null;

    @Column("tinyint", { name: "answer_is_edited", nullable: true, width: 1 })
    answerIsEdited: boolean | null;

    @Column("datetime", { name: "created_at" })
    createdAt: Date;

    @Column("int", { name: "reply_to_question_id", nullable: true })
    replyToQuestionId: number | null;

    @ManyToOne(() => Car, (car) => car.questions, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "car_id", referencedColumnName: "id" }])
    car: Car;

    @ManyToOne(() => User, (user) => user.questions, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @ManyToOne(() => Question, (question) => question.questions, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{ name: "reply_to_question_id", referencedColumnName: "id" }])
    replyToQuestion: Question;

    @OneToMany(() => Question, (question) => question.replyToQuestion)
    questions: Question[];

    @OneToMany(
        () => QuestionInappropriate,
        (questionInappropriate) => questionInappropriate.question
    )
    questionInappropriates: QuestionInappropriate[];

    @OneToMany(() => QuestionLike, (questionLike) => questionLike.question)
    questionLikes: QuestionLike[];

    @BeforeInsert()
    updateDates() {
        this.createdAt = moment().toDate();
    }

    /**
     * If question is already has inappropriate by user then remove inappropriate flag
     */
    async tryToAddInappropriate(user: User) {
        const questionInappropriate = new QuestionInappropriate();

        questionInappropriate.question = this
        questionInappropriate.user = user

        try {
            await questionInappropriate.save()
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
        await QuestionInappropriate.getRepository().delete({
            questionId: this.id,
            user
        })
        await this.save()
    }

    /**
     * If question is already has vote from user then remove vote
     */
    async tryToAddVote(user: User) {
        const questionLike = new QuestionLike();

        questionLike.question = this
        questionLike.user = user

        try {
            await questionLike.save()
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
        await QuestionLike.getRepository().delete({
            questionId: this.id,
            user
        })
        await this.save()
    }
}
