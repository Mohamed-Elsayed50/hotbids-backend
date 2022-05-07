import { ErrorType, ValidationError } from "./ValidationError"

export class ErrorComment implements ValidationError {
    constructor(
        public description,
        public type = ErrorType.Comment
    ) {}
}

export class ErrorCommentNotFound extends ErrorComment {
    constructor() {
        super('Comments not found.')
    }
}

export class ErrorCantPlaceBid extends ErrorComment {
    constructor() {
        super('Can`t place bid.')
    }
}

export class ErrorCantCreateBid extends ErrorComment {
    constructor() {
        super('Can`t create bid.')
    }
}
