import { checkSchema } from 'express-validator'

export class UserLoginInputModel {
    username!: string
    password!: string
}

export const UserLoginInputModelValidation = checkSchema({
    username: { isLength: { options: { min: 1, max: 16 } } },
    password: { isLength: { options: { min: 1, max: 16 } } },
})
