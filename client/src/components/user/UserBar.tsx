'use client'

import { UserProfile } from '@/domain/UserProfile'
import { useAuth } from '../context/AuthContext'
import styles from './userBar.module.css'

export default function UserBar({ user }: { user: UserProfile }) {
    const { logout } = useAuth()
    return (
        <div className={styles.userbar}>
            <div className={styles.user}>{user.username}</div>
            <button onClick={logout}>Logout</button>
        </div>
    )
}
