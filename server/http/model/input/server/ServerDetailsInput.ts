import { z } from 'zod'

export const ServerDetailsSchema = z.object({
    id: z.number().min(1),
})

export type ServerDetailsInput = z.infer<typeof ServerDetailsSchema>
