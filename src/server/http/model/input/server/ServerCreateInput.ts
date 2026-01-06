import { z } from 'zod'

export const ServerCreateSchema = z.object({
    name: z
        .string('Server name must be a string')
        .min(1, 'Server name cannot be empty')
        .max(100, 'Server name must be less than 100 characters'),
    description: z
        .string('Server description must be a string')
        .max(500, 'Server description must be less than 500 characters')
        .optional(),
    icon: z.string('Server icon must be a string').optional(),
})

export type ServerCreateInput = z.infer<typeof ServerCreateSchema>
