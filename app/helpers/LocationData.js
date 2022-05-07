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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationData = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const Location_1 = require("../models/Location");
class LocationData {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            let hasLocations = true;
            console.log('\n--- Start inserting locations ---');
            try {
                yield Location_1.Location.findOneOrFail();
            }
            catch (error) {
                hasLocations = false;
            }
            if (hasLocations) {
                console.log('--- Locations already exists ---\n');
                return;
            }
            try {
                yield LocationData.insertCsv('./app/assets/us.csv', 10);
                yield LocationData.insertCsv('./app/assets/ca_1.csv', 128);
                yield LocationData.insertCsv('./app/assets/ca_2.csv', 128);
                yield LocationData.insertCsv('./app/assets/ca_3.csv', 128);
                yield LocationData.insertCsv('./app/assets/ca_4.csv', 128);
                yield LocationData.insertCsv('./app/assets/ca_5.csv', 128);
                yield LocationData.insertCsv('./app/assets/ca_6.csv', 128);
            }
            catch (error) {
                throw error;
            }
            console.log('--- End inserting locations ---\n');
        });
    }
    static insertCsv(path, chunk = 10) {
        return new Promise((resolve, reject) => {
            const locations = [];
            fs_1.default.createReadStream(path)
                .pipe(csv_parser_1.default())
                .on('data', (data) => {
                locations.push(Location_1.Location.createLocation(data));
            })
                .on('end', () => __awaiter(this, void 0, void 0, function* () {
                console.log(`Start inserting ${path}...`);
                console.time(`End Inserting ${path}`);
                try {
                    yield Location_1.Location.insert(locations, {
                        chunk
                    });
                    resolve(true);
                }
                catch (error) {
                    reject(error);
                }
                console.timeEnd(`End Inserting ${path}`);
            }));
        });
    }
}
exports.LocationData = LocationData;
//# sourceMappingURL=LocationData.js.map