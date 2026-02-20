'use client'

import ToolBar from '@/components/chat/top/toolbar/ToolBar'
import { ChannelSummary } from '@rtchat/shared'
import styles from './top.module.css'

type ChatTopProps = {
    channel: ChannelSummary
    showMembersToggle: () => void
}

export default function ChatTop({ channel, showMembersToggle }: ChatTopProps) {
    return (
        <div className={styles.container}>
            <div className={styles.headercontainer}>
                <div className={styles.name}>
                    <h3>{channel.name}</h3>
                </div>
                <div className={styles.description}>
                    <h4>{channel.description}</h4>
                </div>
            </div>
            <ToolBar showMembersToggle={showMembersToggle} />
        </div>
    )
}
