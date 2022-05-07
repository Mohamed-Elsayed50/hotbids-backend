"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUserNotVerified = exports.ErrorUserVerification = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorUserVerification {
    constructor(description, type = ValidationError_1.ErrorType.UserVerification) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorUserVerification = ErrorUserVerification;
class ErrorUserNotVerified extends ErrorUserVerification {
    constructor(user) {
        super('User not verified.');
        this.user = user;
    }
}
exports.ErrorUserNotVerified = ErrorUserNotVerified;
//# sourceMappingURL=UserVerificationErrors.js.map