'use client'

import { Channel } from '@/domain/Channel'
import styles from './channel.module.css'

type ChannelSlotProps = {
    channel: Channel
    currentlySelected: boolean
    onChangeChannel: () => void
}

export default function ChannelSlot({
    channel,
    currentlySelected,
    onChangeChannel,
}: ChannelSlotProps) {
    return (
        <div className={styles.channel}>
            <button
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
