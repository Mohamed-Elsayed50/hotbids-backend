import { Car } from "../../models/Car";

const createNewBidNotificationContent = (car: Car) => {
    return {
        content: `New bids on the <strong>${ car.title }</strong>`,
        url: `/auctions/${ car.id }`
    }
}

export {
    createNewBidNotificationContent
}

