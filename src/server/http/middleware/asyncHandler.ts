import { NextFunction, Request, RequestHandler, Response } from 'express'
import { logger } from '../../utils/logger'

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            logger.error(
                { error, path: req.path, method: req.method },
                'Request handler error'
            )
            next(error)
        })
    }
}
