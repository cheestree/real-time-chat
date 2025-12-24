'use client'

import { useAuth } from '@/components/context/AuthContext'
import { Button, FormGroup, TextField } from '@mui/material'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import styles from './register.module.css'

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
        <div className={styles.container}>
            <div className={styles.register}>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <TextField
                            type="text"
                            label="Username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            fullWidth
                        />
                    </FormGroup>
                    <FormGroup>
                        <TextField
                            type="email"
                            label="Email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                    </FormGroup>
                    <FormGroup>
                        <TextField
                            type="password"
                            label="Password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                        />
                    </FormGroup>

                    {error && (
                        <div style={{ color: 'red', marginBottom: 8 }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ color: 'green', marginBottom: 8 }}>
                            Registration successful! Redirecting...
                        </div>
                    )}

                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
