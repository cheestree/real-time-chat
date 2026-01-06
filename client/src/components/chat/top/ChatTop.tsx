'use client'

import ToolBar from '@/components/chat/top/toolbar/ToolBar'
import Description from '@/components/description/Description'
import { Channel } from '@/domain/Channel'
import styles from './top.module.css'

type ChatTopProps = {
    channel: Channel
    showMembersToggle: () => void
}

export default function ChatTop({ channel, showMembersToggle }: ChatTopProps) {
    return (
        <div className={styles.container}>
            <Description
                name={channel.name}
                description={channel.description}
            />
            <ToolBar showMembersToggle={showMembersToggle} />
        </div>
    )
}
