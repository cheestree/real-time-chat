import { z } from 'zod'

export const UserLoginSchema = z.object({
    username: z.string().min(1).max(16),
    password: z.string().min(1).max(16),
})

export type UserLoginInput = z.infer<typeof UserLoginSchema>
