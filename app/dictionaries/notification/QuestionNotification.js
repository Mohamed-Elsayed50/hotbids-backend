"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestionAnsweredNotificationContent = void 0;
const createQuestionAnsweredNotificationContent = (car) => {
    return {
        content: `A question on the <strong>${car.title}</strong> was answered.`,
        url: `/auctions/${car.id}`
    };
};
exports.createQuestionAnsweredNotificationContent = createQuestionAnsweredNotificationContent;
//# sourceMappingURL=QuestionNotification.js.map