'use client'

import { ChannelDetail } from '@rtchat/shared'
import styles from './channel.module.css'

type ChannelProps = {
    channel: ChannelDetail
    currentlySelected: boolean
    onChangeChannel: () => void
}

export default function Channel({
    channel,
    currentlySelected,
    onChangeChannel,
}: ChannelProps) {
    return (
        <div className={styles.channelItem}>
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
