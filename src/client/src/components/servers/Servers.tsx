'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useContextMenu } from '@/components/context/ContextMenuContext'
import { useSocket } from '@/components/context/SocketContext'
import Server from '@/components/servers/server/Server'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import ServerCreateForm from '@/components/servers/ServerCreateForm'
import styles from './servers.module.css'

export default function Servers() {
    const { servers, changeServer, deleteServer, leaveServer } = useSocket()
    const { openContextMenu } = useContextMenu()
    const { loggedUser } = useAuth()
    const { handleShow } = useOverlay()

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
                <button onClick={() => handleShow(<ServerCreateForm />)}>
                    +
                </button>
            </div>
        </div>
    )
}
