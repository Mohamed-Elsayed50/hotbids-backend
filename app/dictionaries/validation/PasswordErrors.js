"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSignInPasswordDoesntMatch = exports.ErrorPasswordDoesntMatch = exports.ErrorPassword = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorPassword {
    constructor(description, type = ValidationError_1.ErrorType.Password) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorPassword = ErrorPassword;
class ErrorPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super('Password must be at least 8 characters long, contain uppercase letter, lowercase letters, and numbers.');
    }
}
exports.ErrorPasswordDoesntMatch = ErrorPasswordDoesntMatch;
class ErrorSignInPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super('Incorrect password.', ValidationError_1.ErrorType.SignInPassword);
    }
}
exports.ErrorSignInPasswordDoesntMatch = ErrorSignInPasswordDoesntMatch;
//# sourceMappingURL=PasswordErrors.js.map