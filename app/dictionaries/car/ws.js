"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_CAR = exports.wsRooms = exports.wsActions = exports.wsEvents = void 0;
var wsEvents;
(function (wsEvents) {
    wsEvents["CAR_PAUSE"] = "CAR_PAUSE";
    wsEvents["CAR_CONTINUE"] = "CAR_CONTINUE";
    wsEvents["CAR_RESTART"] = "CAR_RESTART";
    wsEvents["CAR_FINISH"] = "CAR_FINISH";
    wsEvents["CAR_UPDATED"] = "CAR_UPDATED";
})(wsEvents = exports.wsEvents || (exports.wsEvents = {}));
var wsActions;
(function (wsActions) {
})(wsActions = exports.wsActions || (exports.wsActions = {}));
var wsRooms;
(function (wsRooms) {
})(wsRooms = exports.wsRooms || (exports.wsRooms = {}));
function ROOM_CAR(car) {
    return `car-${car.id}`;
}
exports.ROOM_CAR = ROOM_CAR;
//# sourceMappingURL=ws.js.map