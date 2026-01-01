import { z } from 'zod'

export const ServerExistsSchema = z.object({
    id: z.number().min(1),
})

export type ServerExistsInput = z.infer<typeof ServerExistsSchema>
