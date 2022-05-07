"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuctionAwaitingApprovalNotificationContent = exports.createAuctionStartedNotificationContent = exports.createAuctionEndNotificationContent = exports.createAuctionEndingSoonNotificationContent = void 0;
const createAuctionEndingSoonNotificationContent = (car) => {
    return {
        content: `<strong>${car.title}</strong> is ending soon.`,
        url: `/auctions/${car.id}`
    };
};
exports.createAuctionEndingSoonNotificationContent = createAuctionEndingSoonNotificationContent;
const createAuctionEndNotificationContent = (car) => {
    return {
        content: `Auction ended on the <strong>${car.title}</strong>`,
        url: `/auction-management`
    };
};
exports.createAuctionEndNotificationContent = createAuctionEndNotificationContent;
const createAuctionStartedNotificationContent = (car) => {
    return {
        content: `Auction started on the <strong>${car.title}</strong>`,
        url: `/auction-management`
    };
};
exports.createAuctionStartedNotificationContent = createAuctionStartedNotificationContent;
const createAuctionAwaitingApprovalNotificationContent = (car) => {
    return {
        content: `New car ${car.title} is awaiting approval`,
        url: `/car-manager`,
        carId: car.id
    };
};
exports.createAuctionAwaitingApprovalNotificationContent = createAuctionAwaitingApprovalNotificationContent;
//# sourceMappingURL=CarNotification.js.map