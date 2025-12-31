import { z } from 'zod'

export const ServerCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
})

export type ServerCreateInput = z.infer<typeof ServerCreateSchema>
