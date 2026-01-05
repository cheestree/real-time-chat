import { z } from 'zod'

export const ServerExistsSchema = z.object({
    serverId: z
        .string('Server ID must be a string')
        .uuid('Invalid server ID format'),
})

export type ServerExistsInput = z.infer<typeof ServerExistsSchema>
