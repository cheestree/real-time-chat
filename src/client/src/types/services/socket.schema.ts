import z from 'zod'

// Client-only socket schemas
export const deleteServerSocketSchema = z.object({
    id: z.string(),
})
export type DeleteServerSocketSchema = z.infer<typeof deleteServerSocketSchema>
