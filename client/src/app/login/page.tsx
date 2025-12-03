'use client'

import { useAuth } from '@/components/context/AuthContext'
import { Button, FormGroup, TextField } from '@mui/material'
import { redirect } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

import styles from './login.module.css'

export default function Login() {
    const { login, isLoggedIn } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        await login(username, password)

        setUsername('')
        setPassword('')
    }

    useEffect(() => {
        if (isLoggedIn) redirect('/app')
    }, [isLoggedIn])

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

                    <Button variant="contained" color="primary" type="submit">
                        Login
                    </Button>
                </form>
            </div>
        </div>
    )
}
