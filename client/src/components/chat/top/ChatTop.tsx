'use client'

import ChannelDescription from '@/components/channel/channel/ChannelDescription'
import CustomToolBar from '@/components/chat/top/customtoolbar/CustomToolBar'
import { Channel } from '@/domain/Channel'
import styles from './top.module.css'

export default function ChatTop({
    channel,
    showMembersToggle,
}: {
    channel: Channel
    showMembersToggle: () => void
}) {
    return (
        <div className={styles.top}>
            <ChannelDescription channel={channel}></ChannelDescription>
            <CustomToolBar showMembersToggle={showMembersToggle} />
        </div>
    )
}
