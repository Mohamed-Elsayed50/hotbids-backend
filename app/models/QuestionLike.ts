import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique
    } from "typeorm";
import {Question} from "./Question";
import {User} from "./User";

@Unique(["userId", "questionId"])
@Index("question_like_to_user", ["userId"], {})
@Index("question_like_to_question", ["questionId"], {})
@Entity("question_like", {schema: "bids"})
export class QuestionLike extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("int", {name: "question_id", nullable: true})
    questionId: number | null;

    @ManyToOne(() => Question, (question) => question.questionLikes, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "question_id", referencedColumnName: "id"}])
    question: Question;

    @ManyToOne(() => User, (user) => user.questionLikes, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;
}
