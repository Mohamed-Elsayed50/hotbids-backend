"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorEmailAlreadySubscribed = exports.ErrorEmailNotFound = exports.ErrorEmailAlreadyExist = exports.ErrorEmail = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorEmail {
    constructor(description, type = ValidationError_1.ErrorType.Email) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorEmail = ErrorEmail;
class ErrorEmailAlreadyExist extends ErrorEmail {
    constructor() {
        super('Email is already exists.');
    }
}
exports.ErrorEmailAlreadyExist = ErrorEmailAlreadyExist;
class ErrorEmailNotFound extends ErrorEmail {
    constructor() {
        super('Email not found.');
    }
}
exports.ErrorEmailNotFound = ErrorEmailNotFound;
class ErrorEmailAlreadySubscribed extends ErrorEmail {
    constructor() {
        super('You are already subscribed.');
    }
}
exports.ErrorEmailAlreadySubscribed = ErrorEmailAlreadySubscribed;
//# sourceMappingURL=EmailErrors.js.map