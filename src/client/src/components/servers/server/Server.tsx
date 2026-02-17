'use client'

import { AuthenticatedUser, ServerDetail } from '@rtchat/shared'
import { ContextMenuOption } from '@/types/contextMenu.types'
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
        const isOwner = server.ownerIds.length > 0

        const options = isOwner
            ? [
                  {
                      label: 'Delete server',
                      action: () => deleteServer(server.id),
                  },
              ]
            : isMember
              ? [
                    {
                        label: 'Leave server',
                        action: () => leaveServer(server.id),
                    },
                ]
              : []
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
