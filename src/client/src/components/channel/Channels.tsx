'use client'

import ChannelCreateForm from '@/components/channel/ChannelCreateForm'
import ChannelItem from '@/components/channel/channel/Channel'
import { useOverlay } from '@/components/context/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import styles from './channels.module.css'

type ChannelsProps = {
    currentServer: Server
    onChangeChannel: (id: string) => void
}

export default function Channels({
    currentServer,
    onChangeChannel,
}: ChannelsProps) {
    const { currentChannelId } = useSocket()
    const { handleShow } = useOverlay()

    return (
        <div className={styles.container}>
            <button
                onClick={() => handleShow(<ChannelCreateForm />)}
                className={styles.addChannel}
            >
                + Add channel
            </button>
            <div className={styles.channels}>
                {currentServer &&
                    currentServer.channels &&
                    currentServer.channels.map((channel: Channel) => (
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
