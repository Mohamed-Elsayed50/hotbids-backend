"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const { combine, timestamp, prettyPrint } = winston_1.format;
const getPathToLogs = (filename) => path_1.default.resolve(__dirname, `../../logs/${filename}`);
const Logger = winston_1.createLogger({
    level: 'info',
    format: combine(timestamp(), prettyPrint()),
    transports: [
        new winston_1.transports.File({ filename: getPathToLogs('combined.log'), level: 'info' }),
    ],
    exceptionHandlers: [
        new winston_1.transports.File({ filename: getPathToLogs('exceptions.log') })
    ]
});
exports.default = Logger;
//# sourceMappingURL=Logger.js.map