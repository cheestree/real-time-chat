'use client'

import CustomToolBar from '@/components/chat/top/customtoolbar/CustomToolBar'
import Description from '@/components/description/Description'
import { Channel } from '@/domain/Channel'
import styles from './top.module.css'

type ChatTopProps = {
    channel: Channel
    showMembersToggle: () => void
}

export default function ChatTop({ channel, showMembersToggle }: ChatTopProps) {
    return (
        <div className={styles.top}>
            <Description
                name={channel.name}
                description={channel.description}
            ></Description>
            <CustomToolBar showMembersToggle={showMembersToggle} />
        </div>
    )
}
