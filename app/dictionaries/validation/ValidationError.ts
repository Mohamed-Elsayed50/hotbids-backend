export enum ErrorType {
    Email = 'Email',
    Username = 'Username',
    Password = 'Password',
    Comment = 'Comment',
    SignInPassword = 'SignInPassword',
    SignInUsername = 'SignInUsername',
    UserVerification = 'UserVerification',
    LocationZipCode = 'LocationZipCode',
    LocationCity = 'LocationCity',
    AccessDenied = 'AccessDenied',
    NotFound = 'NotFound',
    VIN = 'VIN',
    Autocheck = 'Autocheck',
    Recaptcha = 'Recaptcha'
}

export enum SocketErrorType {
    Auth = 'Auth',
}

export enum SocketErrorStatus {
    Failed = 'Failed'
}

export class ValidationError {
    type: ErrorType
    description: string
}

export class SocketValidationError {
    status: SocketErrorStatus
    type: SocketErrorType
    description: string
}
