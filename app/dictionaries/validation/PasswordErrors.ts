import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorPassword implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Password) {}
}

export class ErrorPasswordDoesntMatch extends ErrorPassword {
    constructor() {
        super('Password must be at least 8 characters long, contain uppercase letter, lowercase letters, and numbers.')
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
