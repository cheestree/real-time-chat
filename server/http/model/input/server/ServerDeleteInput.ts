import { z } from 'zod'

export const ServerDeleteSchema = z.object({
    id: z.number().min(1),
})

export type ServerDeleteInput = z.infer<typeof ServerDeleteSchema>
