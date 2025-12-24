import { checkSchema } from 'express-validator'

export class UserRegister {
    username!: string
    email!: string
    password!: string
}

export const UserRegisterValidation = checkSchema({
    username: { isLength: { options: { min: 1, max: 16 } } },
    email: { isEmail: true },
    password: { isLength: { options: { min: 1, max: 16 } } },
})
