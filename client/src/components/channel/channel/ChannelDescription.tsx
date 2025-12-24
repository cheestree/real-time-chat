'use client'

import { CustomChannel } from '@/domain/CustomChannel'
import { HorizontalRule } from '@mui/icons-material'

import styles from './channelDescription.module.css'

export default function ChannelDescription({
    channel,
}: {
    channel: CustomChannel
}) {
    return (
        <div className={styles.channel}>
            <div className={styles.channelName}>
                <h3>{channel.name}</h3>
            </div>
            <HorizontalRule />
            <div className={styles.channelDescription}>
                <h4>{channel.description}</h4>
            </div>
        </div>
    )
}
