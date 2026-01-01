'use client'

import ChannelComponent from '@/components/channel/channel/Channel'
import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import styles from './channels.module.css'

export default function Channels({
    servers,
    currentServer,
    currentChannel,
    changeChannel,
}: {
    servers: Server[]
    currentServer: number
    currentChannel: number
    changeChannel: (id: number) => void
}) {
    return (
        <div className={styles.channels}>
            {servers[currentServer] &&
                servers[currentServer].channels &&
                servers[currentServer].channels.map(
                    (channel: Channel, index: number) => (
                        <ChannelComponent
                            key={index}
                            channel={channel}
                            currentlySelected={currentChannel}
                            index={index}
                            changeChannel={(id) => changeChannel(id)}
                        />
                    )
                )}
        </div>
    )
}
