import { ErrorType, ValidationError } from './ValidationError'

export class ErrorRecaptcha implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Recaptcha
    ) { }
}

export class ErrorTokenNotFound extends ErrorRecaptcha {
    constructor() {
        super(
            'Recaptcha is required',
        )
    }
}

export class ErrorTokenNotVerified extends ErrorRecaptcha {
    constructor() {
        super(
            'Please, resubmit captcha',
        )
    }
}
