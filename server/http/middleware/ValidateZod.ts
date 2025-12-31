import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodSchema } from 'zod'

export function validateZod(schema: ZodSchema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ errors: result.error })
        }
        req.body = result.data
        next()
    }
}
