import Image from 'next/image'
import styles from './member.module.css'

export default function Member({
    name,
    status,
    icon,
    key,
}: {
    name: string
    status: boolean
    icon: string
    key: number
}) {
    return (
        <div className={styles.member} key={key}>
            <div className={styles.memberIcon}>
                {icon ? <Image alt="" src={icon} /> : name[0]}
            </div>
            <div className={styles.memberName}>{name}</div>
        </div>
    )
}
