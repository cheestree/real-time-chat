'use client'

import Channel from '@/components/channel/channel/Channel'

import { CustomChannel } from '@/domain/CustomChannel'
import { CustomServer } from '@/domain/CustomServer'
import styles from './channels.module.css'

export default function Channels({
    servers,
    currentServer,
    currentChannel,
    changeChannel,
}: {
    servers: CustomServer[]
    currentServer: number
    currentChannel: number
    changeChannel: (id: number) => void
}) {
    return (
        <div className={styles.channels}>
            {servers[currentServer] &&
                servers[currentServer].channels &&
                servers[currentServer].channels.map(
                    (channel: CustomChannel, index: number) => (
                        <Channel
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
