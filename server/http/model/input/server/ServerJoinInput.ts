import { z } from 'zod'

export const ServerJoinSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format'),
})

export type ServerJoinInput = z.infer<typeof ServerJoinSchema>
