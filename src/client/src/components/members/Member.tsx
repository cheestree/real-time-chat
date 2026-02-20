'use client'

import { memo } from 'react'
import styles from './member.module.css'

type MemberProps = {
    id: string
    name: string
    status: boolean
    icon: string
    onClickMember?: (userId: string, username: string) => void
}

function Member({ id, name, icon, onClickMember }: MemberProps) {
    return (
        <div
            className={styles.member}
            key={id}
            onClick={() => onClickMember?.(id, name)}
        >
            <div className={styles.avatar}>
                {icon ? (
                    <img src={icon} alt="" />
                ) : (
                    <div className={styles.defaultAvatar}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className={styles.username}>{name}</div>
        </div>
    )
}

export default memo(Member)
