import { z } from 'zod'

export const UserRegisterSchema = z.object({
    username: z.string().min(1).max(16),
    email: z.string().email(),
    password: z.string().min(1).max(16),
})

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>
