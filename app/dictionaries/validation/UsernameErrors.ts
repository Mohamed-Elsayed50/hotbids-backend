import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorUsername implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Username
    ) {}
}

export class ErrorUsernameAlreadyExist extends ErrorUsername {
    constructor() {
        super('Username is already exists.')
    }
}

export class ErrorSignInUsernameNotFound extends ErrorUsername {
    constructor() {
        super(
            'Username not found.',
            ErrorType.SignInUsername
        )
    }
}

export class ErrorUserNotFound extends ErrorUsername {
    constructor() {
        super(
            'User not found.',
        )
    }
}
