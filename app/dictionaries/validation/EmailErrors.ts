import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorEmail implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Email
    ) {}
}

export class ErrorEmailAlreadyExist extends ErrorEmail {
    constructor() {
        super('Email is already exists.')
    }
}

export class ErrorEmailNotFound extends ErrorEmail {
    constructor() {
        super('Email not found.')
    }
}

export class ErrorEmailAlreadySubscribed extends ErrorEmail {
    constructor() {
        super('You are already subscribed.')
    }
}