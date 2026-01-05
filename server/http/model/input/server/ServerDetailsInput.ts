import { z } from 'zod'

export const ServerDetailsSchema = z.object({
    serverId: z
        .number('Server ID must be a number')
        .min(1, 'Server ID must be greater than 0'),
})

export type ServerDetailsInput = z.infer<typeof ServerDetailsSchema>
