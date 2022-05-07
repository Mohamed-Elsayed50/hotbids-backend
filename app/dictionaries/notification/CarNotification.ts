import { Car } from "../../models/Car";

const createAuctionEndingSoonNotificationContent = (car: Car) => {
    return {
        content: `<strong>${car.title}</strong> is ending soon.`,
        url: `/auctions/${car.id}`
    }
}

const createAuctionEndNotificationContent = (car: Car) => {
    return {
        content: `Auction ended on the <strong>${car.title}</strong>`,
        url: `/auction-management`
    }
}

const createAuctionStartedNotificationContent = (car: Car) => {
    return {
        content: `Auction started on the <strong>${car.title}</strong>`,
        url: `/auction-management`
    }
}

const createAuctionAwaitingApprovalNotificationContent = (car: Car) => {
    return {
        content: `New car ${car.title} is awaiting approval`,
        url: `/car-manager`,
        carId: car.id
    }
}

export {
    createAuctionEndingSoonNotificationContent,
    createAuctionEndNotificationContent,
    createAuctionStartedNotificationContent,
    createAuctionAwaitingApprovalNotificationContent
}

