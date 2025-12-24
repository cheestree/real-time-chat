'use client'

import { UserProfile } from '@/domain/UserProfile'
import { Button } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import styles from './userBar.module.css'

export default function UserBar({ user }: { user: UserProfile }) {
    const { logout } = useAuth()
    return (
        <div className={styles.userbar}>
            <div className={styles.user}>{user.username}</div>
            <Button onClick={logout}>Logout</Button>
        </div>
    )
}
