'use client'

import Server from '@/components/servers/server/Server'
import { useAuthStore } from '@/stores/useAuthStore'
import { useContextMenuStore } from '@/stores/useContextMenuStore'
import { useSocketStore } from '@/stores/useSocketStore'

import ServerCreateForm from '@/components/servers/ServerCreateForm'
import { useOverlayStore } from '@/stores/useOverlayStore'
import styles from './servers.module.css'

export default function Servers() {
    const servers = useSocketStore((state) => state.servers)
    const changeServer = useSocketStore((state) => state.changeServer)
    const deleteServer = useSocketStore((state) => state.deleteServer)
    const leaveServer = useSocketStore((state) => state.leaveServer)
    const openContextMenu = useContextMenuStore((state) => state.open)
    const loggedUser = useAuthStore((state) => state.loggedUser)
    const show = useOverlayStore((state) => state.show)

    return (
        <div className={styles.container}>
            {servers &&
                servers.map((server) => (
                    <Server
                        key={server.id}
                        server={server}
                        user={loggedUser!}
                        openContextMenu={openContextMenu}
                        deleteServer={() => deleteServer(server.id)}
                        leaveServer={leaveServer}
                        changeServer={changeServer}
                    />
                ))}
            <div className={styles.actions}>
                <button onClick={() => show(<ServerCreateForm />)}>+</button>
            </div>
        </div>
    )
}
