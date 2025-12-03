import { CustomChannel } from '@/components/domain/CustomChannel'
import TagIcon from '@mui/icons-material/Tag'
import { Button } from '@mui/material'

import styles from './channel.module.css'

export default function Channel({
    channel,
    currentlySelected,
    index,
    changeChannel,
}: {
    channel: CustomChannel
    currentlySelected: number
    index: number
    changeChannel: (id: number) => void
}) {
    return (
        <div className={styles.channel}>
            <Button
                key={`${channel.name}-${channel.id.toString(10)}`}
                id={channel.id.toString(10)}
                onClick={() => changeChannel(channel.id)}
                style={{
                    backgroundColor:
                        currentlySelected == index
                            ? 'rgba(128, 128, 128, .5)'
                            : 'transparent',
                }}
            >
                <TagIcon />
                <span className={styles.channelName}>{channel.name}</span>
            </Button>
        </div>
    )
}
