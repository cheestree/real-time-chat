'use client'

import Image from 'next/image'
import { memo } from 'react'
import styles from './member.module.css'

type MemberProps = {
    id: string
    name: string
    status: boolean
    icon: string
}

function Member({ id, name, icon }: MemberProps) {
    return (
        <div className={styles.member} key={id}>
            <div className={styles.memberIcon}>
                {icon ? <Image alt="" src={icon} /> : name[0]}
            </div>
            <div className={styles.memberName}>{name}</div>
        </div>
    )
}

export default memo(Member)
