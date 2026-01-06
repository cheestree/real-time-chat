import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { HttpError } from '../../domain/error/Error'
import { logger } from '../../utils/logger'

const ErrorHandler: ErrorRequestHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    _: NextFunction
) => {
    const statusCode = err.status || 500
    const errorLevel = statusCode >= 500 ? 'error' : 'warn'

    logger[errorLevel](
        {
            err,
            statusCode,
            path: req.path,
            method: req.method,
            body: req.body,
        },
        'HTTP error occurred'
    )

    res.setHeader('Content-Type', 'application/problem+json')
    const errorMessage = err.name || 'Internal Server Error'
    res.status(statusCode).json({
        error: errorMessage,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    })
}

export default ErrorHandler
