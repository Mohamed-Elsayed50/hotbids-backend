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
exports.TwillioTokenService = void 0;
const User_1 = require("../models/User");
const twilio_1 = __importDefault(require("twilio"));
const Logger_1 = __importDefault(require("./Logger"));
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const AccessToken = twilio_1.default.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
function TokenGenerator(identity) {
    const chatGrant = new ChatGrant({
        serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
    });
    const token = new AccessToken(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_API_KEY || '', process.env.TWILIO_API_SECRET || '');
    token.addGrant(chatGrant);
    token.identity = identity;
    return token;
}
function deleteChannel(sid) {
    client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
        .channels
        .list()
        .then(channels => {
        channels.forEach(c => {
            // c.remove()
        });
    });
}
function hasChannel(sid) {
    return __awaiter(this, void 0, void 0, function* () {
        const channels = yield client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
            .channels
            .list();
        return channels.some(c => c.sid === sid);
    });
}
const SUPPORT_CHANNEL_UNIQUE_NAME_PREFIX = 'support';
const getSupportUniqueChannelName = (username) => `${SUPPORT_CHANNEL_UNIQUE_NAME_PREFIX}_${username}`;
function createChannel(users) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.TWILIO_CHAT_SERVICE_SID)
            return;
        const client = twilio_1.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN), channelsService = yield client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID).channels, channels = yield channelsService.list();
        const createChannelPromisses = [];
        const channelNames = channels.map(c => c.uniqueName);
        users.forEach(user => {
            const uniqueName = getSupportUniqueChannelName(user.username);
            const hasChannel = channelNames.includes(uniqueName);
            if (!hasChannel && user.username) {
                createChannelPromisses.push(channelsService.create({
                    uniqueName: uniqueName,
                    friendlyName: user.username
                }));
            }
        });
        const result = yield Promise.allSettled(createChannelPromisses);
    });
}
function addMessage(user, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = twilio_1.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN), channelsService = yield client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID || '').channels, channels = yield channelsService.list();
        const uniqueName = getSupportUniqueChannelName(user.username);
        const hasChannel = channels.map(c => c.uniqueName).includes(uniqueName);
        let userChannel;
        if (!hasChannel && user.username) {
            userChannel = yield channelsService.create({
                uniqueName: uniqueName,
                friendlyName: user.username
            });
        }
        else {
            userChannel = channels.find(c => c.uniqueName === uniqueName);
        }
        if (userChannel && user.username) {
            userChannel
                .messages()
                .create({
                body: text,
                from: user.username,
            })
                .then(f => { })
                .catch(f => Logger_1.default.error(f));
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield User_1.User.find({
            where: {
                verified: 1
            }
        });
        try {
            yield createChannel(users);
        }
        catch (error) {
        }
        client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
            .update({
            postWebhookUrl: process.env.TWILIO_POST_WEBHOOK_URL,
            webhookFilters: ['onMessageSent'],
            webhookMethod: 'POST'
        })
            .then(service => {
        })
            .catch(e => {
        });
    });
}
const TwillioTokenService = {
    hasChannel,
    generate: TokenGenerator,
    createChannel,
    init,
    addMessage,
};
exports.TwillioTokenService = TwillioTokenService;
//# sourceMappingURL=TwillioTokenService.js.map