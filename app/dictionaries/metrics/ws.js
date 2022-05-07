"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsRooms = exports.wsActions = exports.wsEvents = void 0;
var wsEvents;
(function (wsEvents) {
    wsEvents["STATISTICAL_UPDATE_LIVE_AUCTIONS"] = "STATISTICAL_UPDATE_LIVE_AUCTIONS";
    wsEvents["STATISTICAL_UPDATE_PENDING_UPPROVAL"] = "STATISTICAL_UPDATE_PENDING_UPPROVAL";
    wsEvents["STATISTICAL_UPDATE_NEW_MESSAGE"] = "STATISTICAL_UPDATE_NEW_MESSAGE";
    wsEvents["STATISTICAL_UPDATE_CLOSED_AUCTIONS"] = "STATISTICAL_UPDATE_CLOSED_AUCTIONS";
    wsEvents["STATISTICAL_UPDATE_USERS_ONLINE"] = "STATISTICAL_UPDATE_USERS_ONLINE";
    wsEvents["STATISTICAL_UPDATE_NEW_REGISTERED_USERS"] = "STATISTICAL_UPDATE_NEW_REGISTERED_USERS";
    wsEvents["STATISTICAL_UPDATE_TODAY_SALES"] = "STATISTICAL_UPDATE_TODAY_SALES";
    wsEvents["STATISTICAL_UPDATE_TODAY_CARS_SALED"] = "STATISTICAL_UPDATE_TODAY_CARS_SALED";
    wsEvents["JOIN_TO_DASHBOARD"] = "JOIN_TO_DASHBOARD";
})(wsEvents = exports.wsEvents || (exports.wsEvents = {}));
var wsActions;
(function (wsActions) {
    wsActions["ACTION_JOIN_TO_DASHBOARD"] = "ACTION_JOIN_TO_DASHBOARD";
})(wsActions = exports.wsActions || (exports.wsActions = {}));
var wsRooms;
(function (wsRooms) {
    wsRooms["ROOM_DASHBOARD"] = "ROOM_DASHBOARD";
})(wsRooms = exports.wsRooms || (exports.wsRooms = {}));
//# sourceMappingURL=ws.js.map