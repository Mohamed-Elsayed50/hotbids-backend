"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.CommentSubscriber = void 0;
const Comment_1 = require("../models/Comment");
const typeorm_1 = require("typeorm");
const Statistic_1 = require("../models/Statistic");
const SocketController_1 = __importDefault(require("../controllers/SocketController"));
const UserManagerWsOptions = __importStar(require("../dictionaries/userManager/ws"));
let CommentSubscriber = class CommentSubscriber {
    listenTo() {
        return Comment_1.Comment;
    }
    afterInsert(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.entity.comment) {
                try {
                    yield Statistic_1.Statistic.add(Statistic_1.StatisticTypes.NEW_COMMENT, 1, true);
                }
                catch (error) {
                    console.log(error);
                }
                try {
                    const user = {
                        id: event.entity.userId,
                        last_comment: event.entity.comment
                    };
                    SocketController_1.default.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER, { user });
                }
                catch (error) {
                    console.log(error);
                }
                try {
                    const comment = event.entity;
                    SocketController_1.default.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.COMMENT_ADD, { comment });
                }
                catch (error) {
                    console.log('afterInsertComment', error);
                }
            }
        });
    }
    afterUpdate(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.updatedColumns.some(c => c.propertyName === 'comment')) {
                const user = {
                    id: event.entity.userId,
                    last_comment: event.entity.comment
                };
                try {
                    SocketController_1.default.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.USER_MANAGER_UPDATE_USER, { user });
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (event.updatedColumns.some(c => c.propertyName === 'inappropriate' || c.propertyName === 'likes')) {
                try {
                    const comment = event.entity;
                    SocketController_1.default.managers.sendToRoom(UserManagerWsOptions.wsRooms.ROOM_USER_MANAGER, UserManagerWsOptions.wsEvents.COMMENT_UPDATE, { comment });
                }
                catch (error) {
                    console.log('afterUpdateComment', error);
                }
            }
        });
    }
};
CommentSubscriber = __decorate([
    typeorm_1.EventSubscriber()
], CommentSubscriber);
exports.CommentSubscriber = CommentSubscriber;
//# sourceMappingURL=CommentSubscriber.js.map