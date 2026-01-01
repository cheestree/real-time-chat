import { z } from 'zod'

export const UserServersSchema = z.object({
    userId: z.string().uuid(),
})

export type UserServersInput = z.infer<typeof UserServersSchema>
