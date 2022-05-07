import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {User} from "./User";

const {v4} = require('uuid')
const moment = require('moment')

@Index("uverif_ibfk_1", ["userId"], {})
@Entity("user_verification", {schema: "bids"})
export class UserVerification extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "user_id", nullable: true})
    userId: number | null;

    @Column("varchar", {name: "token", nullable: true, length: 255})
    token: string | null;

    @Column("datetime", {name: "expire", nullable: true})
    expire: Date | null;

    @ManyToOne(() => User, (user) => user.userVerification, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "user_id", referencedColumnName: "id"}])
    user: User;

    static async createEntity(user: User): Promise<UserVerification | null> {
        let userVerification = new UserVerification();

        userVerification.user = user;
        userVerification.token = v4();
        userVerification.expire = moment().add(1, 'day').toDate();

        try {
            await userVerification.save()
        } catch (err) {
            return null
        }

        if (userVerification)
            return userVerification

        return null
    }
}
