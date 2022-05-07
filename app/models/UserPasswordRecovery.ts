import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {User} from "./User";

const {v4} = require('uuid')
const moment = require('moment')

@Index("uprecovery_ibfk_1", ["userId"], {})
@Entity("user_password_recovery", {schema: "bids"})
export class UserPasswordRecovery extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("varchar", {name: "token", nullable: true, length: 255})
    token: string | null;

    @Column("datetime", {name: "expire", nullable: true})
    expire: Date | null;

    @ManyToOne(() => User, (user) => user.userPasswordRecovery, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    static async createEntity(user: User): Promise<UserPasswordRecovery | null> {
        let userPasswordRecovery = new UserPasswordRecovery();

        userPasswordRecovery.user = user;
        userPasswordRecovery.token = v4();
        userPasswordRecovery.expire = moment().add(1, 'day').toDate();

        try {
            await userPasswordRecovery.save()
        } catch (err) {
            return null
        }

        if (userPasswordRecovery)
            return userPasswordRecovery

        return null
    }
}
