'use client'

import { useLoading } from '@/components/context/LoadingContext'
import { useAuthStore } from '@/stores/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterPage() {
    const { register: registerUser, isLoggedIn } = useAuthStore()
    const { setLoading } = useLoading()
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const onSubmit = async (data: RegisterFormData) => {
        setSuccess(false)
        setLoading(true)
        try {
            const result = await registerUser(
                data.username,
                data.email,
                data.password
            )
            if (result.success) {
                setSuccess(true)
                setTimeout(() => router.replace('/login'), 1000)
            } else {
                setError('root', {
                    message: result.message || 'Registration failed',
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="formContainer">
            <form onSubmit={handleSubmit(onSubmit)} className="formInput">
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        {...register('username')}
                    />
                    {errors.username && (
                        <div style={{ color: 'red', fontSize: '0.875rem' }}>
                            {errors.username.message}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register('email')}
                    />
                    {errors.email && (
                        <div style={{ color: 'red', fontSize: '0.875rem' }}>
                            {errors.email.message}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        {...register('password')}
                    />
                    {errors.password && (
                        <div style={{ color: 'red', fontSize: '0.875rem' }}>
                            {errors.password.message}
                        </div>
                    )}
                </div>

                {errors.root && (
                    <div style={{ color: 'red', marginBottom: 8 }}>
                        {errors.root.message}
                    </div>
                )}

                {success && (
                    <div style={{ color: 'green', marginBottom: 8 }}>
                        Registration successful! Redirecting...
                    </div>
                )}

                <button type="submit">Submit</button>
            </form>
        </section>
    )
}

export default RegisterPage
