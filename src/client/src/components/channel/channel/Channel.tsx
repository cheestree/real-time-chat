'use client'

import { ChannelDetail } from '@/types/api.types'
import styles from './channel.module.css'

type ChannelItemProps = {
    channel: ChannelDetail
    currentlySelected: boolean
    onChangeChannel: () => void
}

export default function ChannelItem({
    channel,
    currentlySelected,
    onChangeChannel,
}: ChannelItemProps) {
    return (
        <div className={styles.channelItem}>
            <button
                className={styles.channelButton}
                key={`${channel.name}-${channel.id}`}
                id={`${channel.id}`}
                onClick={onChangeChannel}
                style={{
                    backgroundColor: currentlySelected
                        ? 'rgba(128, 128, 128, .5)'
                        : 'transparent',
                }}
            >
                <span className={styles.channelName}>{channel.name}</span>
            </button>
        </div>
    )
}
