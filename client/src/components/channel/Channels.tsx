'use client'

import ChannelComponent from '@/components/channel/channel/Channel'
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

    return (
        <div className={styles.channels}>
            {currentServer &&
                currentServer.channels &&
                currentServer.channels.map((channel: Channel) => (
                    <ChannelComponent
                        key={channel.id}
                        channel={channel}
                        currentlySelected={currentChannelId === channel.id}
                        onChangeChannel={() => onChangeChannel(channel.id)}
                    />
                ))}
        </div>
    )
}
