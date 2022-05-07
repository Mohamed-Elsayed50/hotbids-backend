import { User } from '../../models/User'
import { ErrorType, ValidationError } from './ValidationError'

export class ErrorUserVerification implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.UserVerification
    ) {}
}

export class ErrorUserNotVerified extends ErrorUserVerification {
    constructor(public user: User) {
        super('User not verified.')
    }
}
