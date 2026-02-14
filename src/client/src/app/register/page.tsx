'use client'

import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function RegisterPage() {
    const { register, isLoggedIn, isLoading } = useAuthStore()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        setSuccess(false)
        const username = formData.get('username') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await register(username, email, password)
        if (result.success) {
            setSuccess(true)
            setTimeout(() => router.replace('/login'), 1000)
        } else {
            setError(result.message || 'Registration failed')
        }
    }

    return (
        <section className="formContainer">
            <form action={handleSubmit} className="formInput">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                    disabled={isLoading}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    disabled={isLoading}
                />
                {error && (
                    <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
                )}
                {success && (
                    <div style={{ color: 'green', marginBottom: 8 }}>
                        Registration successful! Redirecting...
                    </div>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </section>
    )
}

export default RegisterPage
