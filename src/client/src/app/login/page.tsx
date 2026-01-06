'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

function LoginPage() {
    const { login, isLoggedIn } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        const result = await login(username, password)
        if (result.success) {
            router.replace('/app')
        } else {
            setError(result.message || 'Login failed')
        }
        setUsername('')
        setPassword('')
    }

    return (
        <section className="formContainer">
            <form onSubmit={handleSubmit} className="formInput">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
                )}

                <button type="submit">Login</button>
            </form>
        </section>
    )
}

export default LoginPage
