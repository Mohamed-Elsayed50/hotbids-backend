import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorPassword implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Password) { }
}

export class ErrorPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super('Password must be at least 8 characters long, contain uppercase letters, lowercase letters, special characters, and numbers.')
    }
}

export class ErrorSignInPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super(
            'Incorrect password.',
            ErrorType.SignInPassword
        )
    }
}

export class ErrorZipCodeDoesntExist extends ErrorPassword {
    constructor() {
        super(
            'Incorrect zip code or postal code.',
            ErrorType.LocationZipCode
        )
    }
}

export class ErrorCityDoesntExist extends ErrorPassword {
    constructor() {
        super(
            'Not found city.',
            ErrorType.LocationCity
        )
    }
}

export class ErrorCarNotFound extends ErrorPassword {
    constructor() {
        super(
            'Car not found.',
            ErrorType.NotFound
        )
    }
}

export class ErrorVINDoesntExist extends ErrorPassword {
    constructor() {
        super(
            'VIN is invalid',
            ErrorType.VIN
        )
    }
}

export class ErrorAutocheckFailed extends ErrorPassword {
    constructor() {
        super(
            'Service temporarily unavailable',
            ErrorType.Autocheck
        )
    }
}