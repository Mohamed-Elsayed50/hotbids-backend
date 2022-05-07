"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTokenNotVerified = exports.ErrorTokenNotFound = exports.ErrorRecaptcha = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorRecaptcha {
    constructor(description, type = ValidationError_1.ErrorType.Recaptcha) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorRecaptcha = ErrorRecaptcha;
class ErrorTokenNotFound extends ErrorRecaptcha {
    constructor() {
        super('Recaptcha is required');
    }
}
exports.ErrorTokenNotFound = ErrorTokenNotFound;
class ErrorTokenNotVerified extends ErrorRecaptcha {
    constructor() {
        super('Please, resubmit captcha');
    }
}
exports.ErrorTokenNotVerified = ErrorTokenNotVerified;
//# sourceMappingURL=RecaptchaErrors.js.map