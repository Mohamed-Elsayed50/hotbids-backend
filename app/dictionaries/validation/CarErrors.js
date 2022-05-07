"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAutocheckFailed = exports.ErrorVINDoesntExist = exports.ErrorCarNotFound = exports.ErrorCityDoesntExist = exports.ErrorZipCodeDoesntExist = exports.ErrorSignInPasswordDoesntMatch = exports.ErrorPasswordDoesntMatch = exports.ErrorPassword = void 0;
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
        super('Password must be at least 8 characters long, contain uppercase letters, lowercase letters, special characters, and numbers.');
    }
}
exports.ErrorPasswordDoesntMatch = ErrorPasswordDoesntMatch;
class ErrorSignInPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super('Incorrect password.', ValidationError_1.ErrorType.SignInPassword);
    }
}
exports.ErrorSignInPasswordDoesntMatch = ErrorSignInPasswordDoesntMatch;
class ErrorZipCodeDoesntExist extends ErrorPassword {
    constructor() {
        super('Incorrect zip code or postal code.', ValidationError_1.ErrorType.LocationZipCode);
    }
}
exports.ErrorZipCodeDoesntExist = ErrorZipCodeDoesntExist;
class ErrorCityDoesntExist extends ErrorPassword {
    constructor() {
        super('Not found city.', ValidationError_1.ErrorType.LocationCity);
    }
}
exports.ErrorCityDoesntExist = ErrorCityDoesntExist;
class ErrorCarNotFound extends ErrorPassword {
    constructor() {
        super('Car not found.', ValidationError_1.ErrorType.NotFound);
    }
}
exports.ErrorCarNotFound = ErrorCarNotFound;
class ErrorVINDoesntExist extends ErrorPassword {
    constructor() {
        super('VIN is invalid', ValidationError_1.ErrorType.VIN);
    }
}
exports.ErrorVINDoesntExist = ErrorVINDoesntExist;
class ErrorAutocheckFailed extends ErrorPassword {
    constructor() {
        super('Service temporarily unavailable', ValidationError_1.ErrorType.Autocheck);
    }
}
exports.ErrorAutocheckFailed = ErrorAutocheckFailed;
//# sourceMappingURL=CarErrors.js.map