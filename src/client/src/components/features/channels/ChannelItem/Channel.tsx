'use client'

import { ContextMenuOption } from '@/types/contextMenu.types'
import { ChannelDetail } from '@rtchat/shared'
import { MouseEvent } from 'react'
import styles from './channel.module.css'

type ChannelProps = {
    channel: ChannelDetail
    currentlySelected: boolean
    onChangeChannel: () => void
    onContextMenu: (
        e: MouseEvent<HTMLDivElement>,
        options: ContextMenuOption[]
    ) => void
    onDeleteChannel: () => void
}

export default function Channel({
    channel,
    currentlySelected,
    onChangeChannel,
    onContextMenu,
    onDeleteChannel,
}: ChannelProps) {
    const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        onContextMenu(e, [
            {
                label: 'Delete channel',
                action: onDeleteChannel,
                danger: true,
            },
        ])
    }

    return (
        <div className={styles.channelItem} onContextMenu={handleContextMenu}>
            <button
                className={`${styles.channelButton} ${currentlySelected ? styles.selected : ''}`}
                key={`${channel.name}-${channel.id}`}
                id={`${channel.id}`}
                onClick={onChangeChannel}
            >
                <span className={styles.channelName}>{channel.name}</span>
            </button>
        </div>
    )
}
