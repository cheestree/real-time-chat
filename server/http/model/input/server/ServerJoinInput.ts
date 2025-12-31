import { z } from 'zod'

export const ServerJoinSchema = z.object({
    id: z.number().min(1),
})

export type ServerJoinInput = z.infer<typeof ServerJoinSchema>
