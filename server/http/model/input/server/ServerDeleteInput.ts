import { z } from 'zod'

export const ServerDeleteSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format'),
})

export type ServerDeleteInput = z.infer<typeof ServerDeleteSchema>
