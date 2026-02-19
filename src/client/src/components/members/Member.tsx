'use client'

import Image from 'next/image'
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
            style={{ cursor: onClickMember ? 'pointer' : 'default' }}
        >
            <div className={styles.memberIcon}>
                {icon ? <Image alt="" src={icon} /> : name[0]}
            </div>
            <div className={styles.memberName}>{name}</div>
        </div>
    )
}

export default memo(Member)
