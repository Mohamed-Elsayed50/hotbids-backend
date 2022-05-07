import {BaseEntity, Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from './User'


@Index("user_notification_to_user", ["userId",], {})
@Entity("user_notification", {schema: "bids"})
export class UserNotification extends BaseEntity {

    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("tinyint", {name: "daily_email", nullable: true, width: 1})
    dailyEmail: boolean | null;

    @Column("tinyint", {name: "mentioned_in_comments", nullable: true, width: 1})
    mentionedInComments: boolean | null;

    @Column("tinyint", {name: "replies_to_me_in_comments", nullable: true, width: 1})
    repliesToMeInComments: boolean | null;

    @Column("tinyint", {name: "play_sound_when_bids_are_placed", nullable: true, width: 1})
    playSoundWhenBidsArePlaced: boolean | null;

    @Column("tinyint", {name: "2_hours_before_auction_ends", nullable: true, width: 1})
    hoursBeforeAuctionEnds: boolean | null;

    @Column("tinyint", {name: "new_bids_on_watched_auction", nullable: true, width: 1})
    newBidsOnWatchedAuction: boolean | null;

    @Column("tinyint", {name: "new_comments_on_watched_auction", nullable: true, width: 1})
    newCommentsOnWatchedAuction: boolean | null;

    @Column("tinyint", {name: "questions_answered", nullable: true, width: 1})
    questionsAnswered: boolean | null;

    @Column("tinyint", {name: "auctions_results", nullable: true, width: 1})
    auctionsResults: boolean | null;

    @Column("tinyint", {name: "watch_list_notifications_also_via_email", nullable: true, width: 1})
    watchListNotificationsAlsoViaEmail: boolean | null;

    @Column("tinyint", {name: "new_comments_via_email", nullable: true, width: 1})
    newCommentsViaEmail: boolean | null;

    @Column("tinyint", {name: "new_bids_via_email", nullable: true, width: 1})
    newBidsViaEmail: boolean | null;

    @OneToOne(() => User, user => user.userNotification, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT"
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

}
