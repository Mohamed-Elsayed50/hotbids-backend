"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewBidNotificationContent = void 0;
const createNewBidNotificationContent = (car) => {
    return {
        content: `New bids on the <strong>${car.title}</strong>`,
        url: `/auctions/${car.id}`
    };
};
exports.createNewBidNotificationContent = createNewBidNotificationContent;
//# sourceMappingURL=BidNotification.js.map