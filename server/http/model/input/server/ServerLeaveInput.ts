import { z } from 'zod'

export const ServerLeaveSchema = z.object({
    id: z.number().min(1),
})

export type ServerLeaveInput = z.infer<typeof ServerLeaveSchema>
