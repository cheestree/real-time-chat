'use client'

import { useLoading } from '@/components/context/LoadingContext'
import { useAuthStore } from '@/stores/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import styles from './page.module.css'

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginPage() {
    const { login, isLoggedIn } = useAuthStore()
    const { setLoading } = useLoading()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true)
        try {
            const result = await login(data.username, data.password)
            if (result.success) {
                router.replace('/app')
            } else {
                setError('root', {
                    message: result.message || 'Login failed',
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
                        <div className={styles.errorText}>
                            {errors.username.message}
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
                        <div className={styles.errorText}>
                            {errors.password.message}
                        </div>
                    )}
                </div>

                {errors.root && (
                    <div className={styles.rootError}>
                        {errors.root.message}
                    </div>
                )}

                <button type="submit">Login</button>
            </form>
            <div>
                <p>
                    Don't have an account?{' '}
                    <a href="/register" className={styles.link}>
                        Register here
                    </a>
                </p>
            </div>
        </section>
    )
}

export default LoginPage
