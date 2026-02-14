'use client'

import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function LoginPage() {
    const { login, isLoggedIn, isLoading } = useAuthStore()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        const username = formData.get('username') as string
        const password = formData.get('password') as string

        const result = await login(username, password)
        if (result.success) {
            router.replace('/app')
        } else {
            setError(result.message || 'Login failed')
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
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    disabled={isLoading}
                />

                {error && (
                    <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </section>
    )
}

export default LoginPage
