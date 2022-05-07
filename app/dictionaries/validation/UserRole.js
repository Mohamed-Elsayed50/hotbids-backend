"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUserAccessDenied = exports.ErrorAccessDenied = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorAccessDenied {
    constructor(description, type = ValidationError_1.ErrorType.AccessDenied) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorAccessDenied = ErrorAccessDenied;
class ErrorUserAccessDenied extends ErrorAccessDenied {
    constructor() {
        super('User does`t have permission.');
    }
}
exports.ErrorUserAccessDenied = ErrorUserAccessDenied;
//# sourceMappingURL=UserRole.js.map