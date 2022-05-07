"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsRooms = exports.wsActions = exports.wsEvents = void 0;
var wsEvents;
(function (wsEvents) {
    wsEvents["CAR_MANAGER_UPDATE_CAR"] = "CAR_MANAGER_UPDATE_CAR";
    wsEvents["CAR_MANAGER_NEW_BID"] = "CAR_MANAGER_NEW_BID";
    wsEvents["CAR_MANAGER_NEW_CAR"] = "CAR_MANAGER_NEW_CAR";
    wsEvents["CAR_MANAGER_CAR_ENDED"] = "CAR_MANAGER_CAR_ENDED";
    wsEvents["AUCTION_MANAGER_NEW_CAR"] = "AUCTION_MANAGER_NEW_CAR";
    wsEvents["JOIN_TO_CAR_MANAGER"] = "JOIN_TO_CAR_MANAGER";
})(wsEvents = exports.wsEvents || (exports.wsEvents = {}));
var wsActions;
(function (wsActions) {
    wsActions["ACTION_JOIN_TO_CAR_MANAGER"] = "ACTION_JOIN_TO_CAR_MANAGER";
    wsActions["ACTION_DELETE_CAR"] = "ACTION_DELETE_CAR";
    wsActions["ACTION_VERIFY_CAR"] = "ACTION_VERIFY_CAR";
})(wsActions = exports.wsActions || (exports.wsActions = {}));
var wsRooms;
(function (wsRooms) {
    wsRooms["ROOM_CAR_MANAGER"] = "ROOM_CAR_MANAGER";
})(wsRooms = exports.wsRooms || (exports.wsRooms = {}));
//# sourceMappingURL=ws.js.map