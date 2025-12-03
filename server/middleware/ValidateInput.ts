import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import { BadRequestError } from '../domain/error/Error'

export const ValidateInput: RequestHandler = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    console.log(errors)
    throw new BadRequestError('Input is not correct')
}
