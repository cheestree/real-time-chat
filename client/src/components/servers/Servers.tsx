'use client'

import { useAuth } from '@/components/context/AuthContext'
import { useContextMenu } from '@/components/context/ContextMenuContext'
import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import ServerCreateForm from '@/components/servers/ServerCreateForm'
import { Add } from '@mui/icons-material'
import styled from 'styled-components'

import Server from '@/components/servers/server/Server'
import styles from './server.module.css'

const Scrollbar = styled.div`
    &::-webkit-scrollbar {
        width: 4px;
        background: transparent;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: transparent;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 16px;
    }

    /* Handle on hover */
    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`

export default function Servers() {
    const { servers, changeServer, deleteServer, leaveServer } = useSocket()
    const { handleShow } = useOverlay()
    const { openContextMenu } = useContextMenu()
    const { loggedUser } = useAuth()

    return (
        <Scrollbar className={styles.servers}>
            {servers &&
                servers.map((server) => (
                    <Server
                        key={server.id}
                        server={server}
                        user={loggedUser!}
                        openContextMenu={openContextMenu}
                        deleteServer={deleteServer}
                        leaveServer={leaveServer}
                        changeServer={changeServer}
                    />
                ))}
            <button
                className={styles.server}
                onClick={() => handleShow(<ServerCreateForm />)}
            >
                <Add />
            </button>
        </Scrollbar>
    )
}
