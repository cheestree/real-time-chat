import { checkSchema } from 'express-validator'

export class UserRegisterInputModel {
    username!: string
    email!: string
    password!: string
}

export const UserRegisterInputModelValidation = checkSchema({
    username: { isLength: { options: { min: 1, max: 16 } } },
    email: { isEmail: true },
    password: { isLength: { options: { min: 1, max: 16 } } },
})
