import { UserProfile } from '@/components/domain/UserProfile'

import styles from './userBar.module.css'

export default function UserBar({ user }: { user: UserProfile }) {
    return (
        <div className={styles.userbar}>
            <div className={styles.user}>{user.username}</div>
        </div>
    )
}
