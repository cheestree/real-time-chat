'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useContextMenu } from '@/components/context/ContextMenuContext'
import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import ServerCreateForm from '@/components/servers/ServerCreateForm'

import Server from '@/components/servers/server/Server'
import styles from './server.module.css'

export default function Servers() {
    const { servers, changeServer, deleteServer, leaveServer } = useSocket()
    const { handleShow } = useOverlay()
    const { openContextMenu } = useContextMenu()
    const { loggedUser } = useAuth()

    return (
        <div className={styles.servers}>
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
            <button
                className={styles.server}
                onClick={() => handleShow(<ServerCreateForm />)}
            >
                <span className={styles.addServer}>+</span>
            </button>
        </div>
    )
}
