import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {User} from "./User";
const { v4 } = require('uuid')
const moment = require('moment')

@Index("user_access_token_to_user", ["userId"], {})
@Entity("user_access_token", {schema: "bids"})
export class UserAccessToken extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("varchar", {name: "token", nullable: true, length: 255})
    token: string | null;

    @Column("datetime", {name: "expire", nullable: true})
    expire: Date | null;

    @ManyToOne(() => User, (user) => user.userAccessTokens, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    static async createAccessToken(user: User): Promise<UserAccessToken | null> {
        let userAccessToken = new UserAccessToken();

        userAccessToken.user = user;
        userAccessToken.token = v4();
        userAccessToken.expire = moment().add(1, 'month').toDate();

        try {
            await userAccessToken.save()
        } catch (err) {
            return null
        }

        if (userAccessToken)
            return userAccessToken

        return null
    }
}
