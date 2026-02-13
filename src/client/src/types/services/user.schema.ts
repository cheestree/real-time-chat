import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
})

export type RegisterSchema = z.infer<typeof registerSchema>
