"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsRooms = exports.wsActions = exports.wsEvents = void 0;
var wsEvents;
(function (wsEvents) {
    wsEvents["USER_MANAGER_DELETE_USER"] = "USER_MANAGER_DELETE_USER";
    wsEvents["USER_MANAGER_UPDATE_USER"] = "USER_MANAGER_UPDATE_USER";
    wsEvents["USER_MANAGER_ADD_USER"] = "USER_MANAGER_ADD_USER";
    wsEvents["USER_MANAGER_EDIT_COMMENT"] = "USER_MANAGER_EDIT_COMMENT";
    wsEvents["JOIN_TO_USER_MANAGER"] = "JOIN_TO_USER_MANAGER";
    wsEvents["USER_MANAGER_UPDATE_USER_CAR"] = "USER_MANAGER_UPDATE_USER_CAR";
    wsEvents["USER_MANAGER_NEW_USER_CAR"] = "USER_MANAGER_NEW_USER_CAR";
    wsEvents["USER_MANAGER_UPDATE_COMMENT"] = "USER_MANAGER_UPDATE_COMMENT";
    wsEvents["COMMENT_DELETE"] = "COMMENT_DELETE";
    wsEvents["COMMENT_ADD"] = "COMMENT_ADD";
    wsEvents["COMMENT_UPDATE"] = "COMMENT_UPDATE";
})(wsEvents = exports.wsEvents || (exports.wsEvents = {}));
var wsActions;
(function (wsActions) {
    wsActions["ACTION_JOIN_TO_USER_MANAGER"] = "ACTION_JOIN_TO_USER_MANAGER";
    wsActions["ACTION_DELETE_USER"] = "ACTION_DELETE_USER";
    wsActions["ACTION_EDIT_COMMENT"] = "ACTION_EDIT_COMMENT";
    wsActions["ACTION_DELETE_COMMENTS"] = "ACTION_DELETE_COMMENTS";
})(wsActions = exports.wsActions || (exports.wsActions = {}));
var wsRooms;
(function (wsRooms) {
    wsRooms["ROOM_USER_MANAGER"] = "ROOM_USER_MANAGER";
})(wsRooms = exports.wsRooms || (exports.wsRooms = {}));
//# sourceMappingURL=ws.js.map