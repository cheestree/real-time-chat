'use client'

import { AuthenticatedUser } from '@rtchat/shared'
import styles from './userBar.module.css'

type UserBarProps = {
    user: AuthenticatedUser
    logout: () => void
}

export default function UserBar({ user, logout }: UserBarProps) {
    return (
        <div className={styles.container}>
            <div className={styles.username}>{user.profile.username}</div>
            <button className={styles.logout} onClick={logout}>
                Logout
            </button>
        </div>
    )
}
