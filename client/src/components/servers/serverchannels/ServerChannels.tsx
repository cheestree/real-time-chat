'use client'

import AddChannelForm from '@/components/channel/AddChannelForm'
import Channels from '@/components/channel/Channels'
import { Server } from '@/domain/Server'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import styles from './serverChannels.module.css'

type ServerChannelsProps = {
    currentServer: Server
    onChangeChannel: (id: string) => void
}

export default function ServerChannels({
    currentServer,
    onChangeChannel,
}: ServerChannelsProps) {
    const { handleShow } = useOverlay()

    return (
        <div className={styles.serverChannels}>
            <Channels
                currentServer={currentServer}
                onChangeChannel={onChangeChannel}
            />

            <div className={styles.addChannel}>
                <button onClick={() => handleShow(<AddChannelForm />)}>
                    Add channel
                </button>
            </div>
        </div>
    )
}
