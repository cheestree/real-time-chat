'use client'

import { useAuth } from '@/components/context/AuthContext'
import { Button, FormGroup, TextField } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import styles from './login.module.css'

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
        <div className={styles.container}>
            <div className={styles.login}>
                <form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                        <TextField
                            type="text"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            fullWidth
                        />
                    </FormGroup>

                    <FormGroup className="mb-3">
                        <TextField
                            type="password"
                            label="Password"
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

                    <Button variant="contained" color="primary" type="submit">
                        Login
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
