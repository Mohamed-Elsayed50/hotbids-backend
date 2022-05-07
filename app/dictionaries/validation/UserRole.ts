import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorAccessDenied implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.AccessDenied
    ) {}
}

export class ErrorUserAccessDenied extends ErrorAccessDenied {
    constructor() {
        super('User does`t have permission.')
    }
}
