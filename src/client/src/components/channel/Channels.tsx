'use client'

import ChannelCreateForm from '@/components/channel/ChannelCreateForm'
import ChannelItem from '@/components/channel/channel/Channel'
import { useOverlayStore } from '@/stores/useOverlayStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ChannelDetail, ServerDetail } from '@/types/api.types'
import styles from './channels.module.css'

type ChannelsProps = {
    currentServer: ServerDetail
    onChangeChannel: (id: string) => void
}

export default function Channels({
    currentServer,
    onChangeChannel,
}: ChannelsProps) {
    const currentChannelId = useSocketStore((state) => state.currentChannelId)
    const show = useOverlayStore((state) => state.show)

    return (
        <div className={styles.container}>
            <button
                onClick={() => show(<ChannelCreateForm />)}
                className={styles.addChannel}
            >
                + Add channel
            </button>
            <div className={styles.channels}>
                {currentServer &&
                    currentServer.channels &&
                    currentServer.channels.map((channel: ChannelDetail) => (
                        <ChannelItem
                            key={channel.id}
                            channel={channel}
                            currentlySelected={currentChannelId === channel.id}
                            onChangeChannel={() => onChangeChannel(channel.id)}
                        />
                    ))}
            </div>
        </div>
    )
}
