import { User } from "app/models/User";
import { Car } from "../../models/Car";

const createNewCommentNotificationContent = (car: Car) => {
    return {
        content: `New comment on the <strong>${ car.title }</strong>`,
        url: `/auctions/${ car.id }`
    }
}

const createReplyCommentNotificationContent = (car: Car, user: User) => {
    return {
        content: `<em>${ user.username }<em/> replied me on the <strong>${ car.title }</strong>`,
        url: `/auctions/${ car.id }`
    }
}

export {
    createNewCommentNotificationContent,
    createReplyCommentNotificationContent
}

