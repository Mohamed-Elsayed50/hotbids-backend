"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewMessageInSupportNotificationContent = void 0;
const createNewMessageInSupportNotificationContent = (username, text = '') => {
    const _text = text.length > 8 ? `${text.substr(0, 8)}...` : text;
    return {
        content: `A new message from <em><strong>${username}: ${_text}</strong><em>.`,
        url: `/support?user=${username}`
    };
};
exports.createNewMessageInSupportNotificationContent = createNewMessageInSupportNotificationContent;
//# sourceMappingURL=SupportNotification.js.map