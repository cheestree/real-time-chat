'use client'

import { Server } from '@/domain/Server'

import styles from './server.module.css'

export default function ServerDescription({
    server,
}: {
    server: Server
}) {
    return (
        <div className={styles.serverCard}>
            <h1 className={styles.serverCardName}>{server.name}</h1>
            <h2 className={styles.serverCardDescription}>
                {server.description}
            </h2>
        </div>
    )
}
