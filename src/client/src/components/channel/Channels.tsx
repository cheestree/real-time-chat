'use client'

import ChannelCreateForm from '@/components/channel/ChannelCreateForm'
import Channel from '@/components/channel/channel/Channel'
import { useContextMenuStore } from '@/stores/useContextMenuStore'
import { useOverlayStore } from '@/stores/useOverlayStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { ChannelDetail, ServerDetail } from '@rtchat/shared'
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
    const deleteChannel = useSocketStore((state) => state.deleteChannel)
    const show = useOverlayStore((state) => state.show)
    const openContextMenu = useContextMenuStore((state) => state.open)

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
                        <Channel
                            key={channel.id}
                            channel={channel}
                            currentlySelected={currentChannelId === channel.id}
                            onChangeChannel={() => onChangeChannel(channel.id)}
                            onContextMenu={openContextMenu}
                            onDeleteChannel={() =>
                                deleteChannel(currentServer.id, channel.id)
                            }
                        />
                    ))}
            </div>
        </div>
    )
}
