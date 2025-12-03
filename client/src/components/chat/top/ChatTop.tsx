import ChannelDescription from '@/components/channel/channel/ChannelDescription'
import CustomToolBar from '@/components/chat/top/customtoolbar/CustomToolBar'
import { CustomChannel } from '@/components/domain/CustomChannel'
import styles from './top.module.css'

export default function ChatTop({
    channel,
    showMembersToggle,
}: {
    channel: CustomChannel
    showMembersToggle: () => void
}) {
    return (
        <div className={styles.top}>
            <ChannelDescription channel={channel}></ChannelDescription>
            <CustomToolBar showMembersToggle={showMembersToggle} />
        </div>
    )
}
