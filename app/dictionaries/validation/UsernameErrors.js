"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUserNotFound = exports.ErrorSignInUsernameNotFound = exports.ErrorUsernameAlreadyExist = exports.ErrorUsername = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorUsername {
    constructor(description, type = ValidationError_1.ErrorType.Username) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorUsername = ErrorUsername;
class ErrorUsernameAlreadyExist extends ErrorUsername {
    constructor() {
        super('Username is already exists.');
    }
}
exports.ErrorUsernameAlreadyExist = ErrorUsernameAlreadyExist;
class ErrorSignInUsernameNotFound extends ErrorUsername {
    constructor() {
        super('Username not found.', ValidationError_1.ErrorType.SignInUsername);
    }
}
exports.ErrorSignInUsernameNotFound = ErrorSignInUsernameNotFound;
class ErrorUserNotFound extends ErrorUsername {
    constructor() {
        super('User not found.');
    }
}
exports.ErrorUserNotFound = ErrorUserNotFound;
//# sourceMappingURL=UsernameErrors.js.map