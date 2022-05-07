"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketValidationError = exports.ValidationError = exports.SocketErrorStatus = exports.SocketErrorType = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["Email"] = "Email";
    ErrorType["Username"] = "Username";
    ErrorType["Password"] = "Password";
    ErrorType["Comment"] = "Comment";
    ErrorType["SignInPassword"] = "SignInPassword";
    ErrorType["SignInUsername"] = "SignInUsername";
    ErrorType["UserVerification"] = "UserVerification";
    ErrorType["LocationZipCode"] = "LocationZipCode";
    ErrorType["LocationCity"] = "LocationCity";
    ErrorType["AccessDenied"] = "AccessDenied";
    ErrorType["NotFound"] = "NotFound";
    ErrorType["VIN"] = "VIN";
    ErrorType["Autocheck"] = "Autocheck";
    ErrorType["Recaptcha"] = "Recaptcha";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
var SocketErrorType;
(function (SocketErrorType) {
    SocketErrorType["Auth"] = "Auth";
})(SocketErrorType = exports.SocketErrorType || (exports.SocketErrorType = {}));
var SocketErrorStatus;
(function (SocketErrorStatus) {
    SocketErrorStatus["Failed"] = "Failed";
})(SocketErrorStatus = exports.SocketErrorStatus || (exports.SocketErrorStatus = {}));
class ValidationError {
}
exports.ValidationError = ValidationError;
class SocketValidationError {
}
exports.SocketValidationError = SocketValidationError;
//# sourceMappingURL=ValidationError.js.map