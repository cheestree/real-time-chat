import { checkSchema } from 'express-validator'

export class UserLogin {
    username!: string
    password!: string
}

export const UserLoginValidation = checkSchema({
    username: { isLength: { options: { min: 1, max: 16 } } },
    password: { isLength: { options: { min: 1, max: 16 } } },
})
