"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCantCreateBid = exports.ErrorCantPlaceBid = exports.ErrorCommentNotFound = exports.ErrorComment = void 0;
const ValidationError_1 = require("./ValidationError");
class ErrorComment {
    constructor(description, type = ValidationError_1.ErrorType.Comment) {
        this.description = description;
        this.type = type;
    }
}
exports.ErrorComment = ErrorComment;
class ErrorCommentNotFound extends ErrorComment {
    constructor() {
        super('Comments not found.');
    }
}
exports.ErrorCommentNotFound = ErrorCommentNotFound;
class ErrorCantPlaceBid extends ErrorComment {
    constructor() {
        super('Can`t place bid.');
    }
}
exports.ErrorCantPlaceBid = ErrorCantPlaceBid;
class ErrorCantCreateBid extends ErrorComment {
    constructor() {
        super('Can`t create bid.');
    }
}
exports.ErrorCantCreateBid = ErrorCantCreateBid;
//# sourceMappingURL=CommentErrors.js.map