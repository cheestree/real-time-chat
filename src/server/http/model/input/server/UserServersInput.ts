import { z } from 'zod'

export const UserServersSchema = z.object({
    userId: z.string('User ID must be a string').uuid('Invalid user ID format'),
})

export type UserServersInput = z.infer<typeof UserServersSchema>
