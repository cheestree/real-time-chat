import { z } from 'zod'

export const UserLoginSchema = z.object({
    username: z
        .string('Username must be a string')
        .min(1, 'Username cannot be empty')
        .max(16, 'Username must be less than 16 characters'),
    password: z
        .string('Password must be a string')
        .min(1, 'Password cannot be empty')
        .max(16, 'Password must be less than 16 characters'),
})

export type UserLoginInput = z.infer<typeof UserLoginSchema>
