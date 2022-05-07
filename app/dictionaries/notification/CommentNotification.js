"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReplyCommentNotificationContent = exports.createNewCommentNotificationContent = void 0;
const createNewCommentNotificationContent = (car) => {
    return {
        content: `New comment on the <strong>${car.title}</strong>`,
        url: `/auctions/${car.id}`
    };
};
exports.createNewCommentNotificationContent = createNewCommentNotificationContent;
const createReplyCommentNotificationContent = (car, user) => {
    return {
        content: `<em>${user.username}<em/> replied me on the <strong>${car.title}</strong>`,
        url: `/auctions/${car.id}`
    };
};
exports.createReplyCommentNotificationContent = createReplyCommentNotificationContent;
//# sourceMappingURL=CommentNotification.js.map