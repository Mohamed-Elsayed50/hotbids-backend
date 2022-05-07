import { Car } from "../../models/Car";

const createQuestionAnsweredNotificationContent = (car: Car) => {
    return {
        content: `A question on the <strong>${ car.title }</strong> was answered.`,
        url: `/auctions/${ car.id }`
    }
}

export {
    createQuestionAnsweredNotificationContent,
}

