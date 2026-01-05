'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

function RegisterPage() {
    const { register, isLoggedIn } = useAuth()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/app')
        }
    }, [isLoggedIn, router])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setSuccess(false)
        const result = await register(username, email, password)
        if (result.success) {
            setSuccess(true)
            setTimeout(() => router.replace('/login'), 1000)
        } else {
            setError(result.message || 'Registration failed')
        }
        setUsername('')
        setEmail('')
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
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
