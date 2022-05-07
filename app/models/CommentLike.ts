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
import {Comment} from "./Comment";
import {User} from "./User";

@Unique(["userId", "commentId"])
@Index("comment_like_to_user", ["userId"], {})
@Index("comment_like_to_comment", ["commentId"], {})
@Entity("comment_like", {schema: "bids"})
export class CommentLike extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("int", {name: "comment_id", nullable: true})
    commentId: number | null;

    @ManyToOne(() => Comment, (comment) => comment.commentLikes, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "comment_id", referencedColumnName: "id"}])
    comment: Comment;

    @ManyToOne(() => User, (user) => user.commentLikes, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;
}
