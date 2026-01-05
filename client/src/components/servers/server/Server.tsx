'use client'

import { ContextMenuOption } from '@/components/context/ContextMenuContext'
import styles from '@/components/servers/server.module.css'
import { Server as ServerType } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'
import Image from 'next/image'
import React from 'react'

export default function Server({
    server,
    user,
    deleteServer,
    openContextMenu,
    leaveServer,
    changeServer,
}: {
    server: ServerType
    user: UserProfile
    deleteServer: (serverId: string) => void
    openContextMenu: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        options: ContextMenuOption[]
    ) => void
    leaveServer: (serverId: string) => void
    changeServer: (serverId: string) => void
}) {
    const handleContextMenu = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        const isMember = server.users.some((u) => u.id === user.id)
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
    )
}
