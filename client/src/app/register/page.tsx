'use client'

import { useAuth } from '@/components/context/AuthContext'
import { Button, FormGroup, TextField } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import styles from './register.module.css'

export default function Register() {
    const { register, isLoggedIn } = useAuth()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useRouter()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        await register(username, email, password)

        if (isLoggedIn) {
            navigate.push('/login')
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

                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    )
}
