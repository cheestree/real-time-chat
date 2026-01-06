'use client'

import { User } from '@/domain/User'
import styles from './userBar.module.css'

type UserBarProps = {
    user: User
    logout: () => void
}

export default function UserBar({ user, logout }: UserBarProps) {
    return (
        <div className={styles.container}>
            <div className={styles.userIcon}>
                {user.profile.icon ? (
                    <img
                        alt="icon"
                        src={user.profile.icon}
                        className={styles.userImage}
                    />
                ) : (
                    user.profile.username[0]
                )}
            </div>
            <button className={styles.logout} onClick={logout}>
                Logout
            </button>
        </div>
    )
}
