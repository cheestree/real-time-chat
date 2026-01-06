import { z } from 'zod'

export const ServerLeaveSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format'),
})

export type ServerLeaveInput = z.infer<typeof ServerLeaveSchema>
