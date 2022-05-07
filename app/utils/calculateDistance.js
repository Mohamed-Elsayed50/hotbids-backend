"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Location_1 = require("../models/Location");
function calculateDistance(zipCode, distance, cars) {
    return __awaiter(this, void 0, void 0, function* () {
        const distances = {};
        const maxDistance = distance * 1.609 || 40075;
        const p = 0.017453292519943295;
        const { lat: curLat, lng: curLng } = yield Location_1.Location.findOrFailLocation({ zipCode, cityAndProvince: '' });
        cars = cars.filter(({ location: loc }) => {
            const { lat, lng } = loc || {};
            if (lat === null || lng === null || curLat === null || curLng === null)
                return false;
            let dist = 0.5 - Math.cos((curLat - lat) * p) / 2
                + Math.cos(lat * p) * Math.cos(curLat * p)
                    * (1 - Math.cos((curLng - lng) * p)) / 2;
            dist = 12742 * Math.asin(Math.sqrt(dist));
            distances[loc.zipCode] = dist;
            return dist <= maxDistance;
        });
        cars.sort((a, b) => distances[a.location.zipCode] - distances[b.location.zipCode]);
        return cars;
    });
}
exports.default = calculateDistance;
//# sourceMappingURL=calculateDistance.js.map