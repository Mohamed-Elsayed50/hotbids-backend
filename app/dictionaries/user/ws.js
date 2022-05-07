"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsActions = exports.wsEvents = void 0;
var wsEvents;
(function (wsEvents) {
    wsEvents["USER_UPDATE_NOTITIFICATIONS"] = "USER_UPDATE_NOTITIFICATIONS";
    wsEvents["USER_UPDATE_PROFILE"] = "USER_UPDATE_PROFILE";
})(wsEvents = exports.wsEvents || (exports.wsEvents = {}));
var wsActions;
(function (wsActions) {
    wsActions["ACTION_READ_NOTIFICATION"] = "ACTION_READ_NOTIFICATION";
    wsActions["ACTION_UPDATE_USER_PROFILE"] = "ACTION_UPDATE_USER_PROFILE";
})(wsActions = exports.wsActions || (exports.wsActions = {}));
//# sourceMappingURL=ws.js.map