import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { HttpError } from '../../domain/error/Error'

const ErrorHandler: ErrorRequestHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    _: NextFunction
) => {
    res.setHeader('Content-Type', 'application/problem+json')
    const statusCode = err.status || 500
    const errorMessage = err.name || 'Internal Server Error'
    res.status(statusCode).json({ error: errorMessage, message: err.message })
}

export default ErrorHandler
