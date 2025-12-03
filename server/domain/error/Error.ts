export class HttpError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(message, 404)
    }
}

export class InternalServerError extends HttpError {
    constructor(message = 'Internal Server Error') {
        super(message, 500)
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'Bad Request Error') {
        super(message, 400)
    }
}

export class Unauthorized extends HttpError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
    }
}
