'use client'

import { ContextMenuOption } from '@/types/contextMenu.types'
import { AuthenticatedUser, ServerDetail } from '@rtchat/shared'
import Image from 'next/image'
import { MouseEvent } from 'react'

import styles from './server.module.css'

type ServerProps = {
    server: ServerDetail
    user: AuthenticatedUser
    deleteServer: (serverId: string) => void
    openContextMenu: (
        event: MouseEvent<HTMLDivElement>,
        options: ContextMenuOption[]
    ) => void
    leaveServer: (serverId: string) => void
    changeServer: (serverId: string) => void
}

export default function Server({
    server,
    user,
    deleteServer,
    openContextMenu,
    leaveServer,
    changeServer,
}: ServerProps) {
    const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
        const isMember = server.users.some((u) => u.id === user.publicId)
        const isOwner = server.ownerIds.some((id) => id === user.publicId)

        const copyServerId = () => {
            navigator.clipboard.writeText(server.id)
        }

        const options: ContextMenuOption[] = [
            {
                label: 'Copy Server ID',
                action: copyServerId,
            },
        ]

        if (isOwner) {
            options.push({
                label: 'Delete Server',
                action: () => deleteServer(server.id),
                danger: true,
            })
        } else if (isMember) {
            options.push({
                label: 'Leave Server',
                action: () => leaveServer(server.id),
            })
        }

        openContextMenu(e, options)
    }

    return (
        <>
            <div onContextMenu={handleContextMenu}>
                <button
                    className={styles.server}
                    onClick={() => changeServer(server.id)}
                >
                    {server.icon ? (
                        <Image src={server.icon} alt={server.name} />
                    ) : (
                        server.name[0]
                    )}
                </button>
            </div>
        </>
    )
}
