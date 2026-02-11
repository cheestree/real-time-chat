'use client'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'

import styles from './form.module.css'

export default function ChannelCreateForm() {
    const { handleClose } = useOverlay()
    const { createChannel } = useSocket()

    const handleCreateChannel = (formData: FormData) => {
        const channelName = formData.get('channelName') as string
        const channelDescription = formData.get('channelDescription') as string
        createChannel(channelName, channelDescription)
        handleClose()
    }

    return (
        <div className={styles.container}>
            <form action={handleCreateChannel} className={styles.form}>
                <input
                    type="text"
                    name="channelName"
                    placeholder="Enter name of the channel"
                    required
                />
                <input
                    type="text"
                    name="channelDescription"
                    placeholder="Enter description of the channel"
                />
                <div className={styles.actions}>
                    <button type="submit">Create</button>
                    <button type="button" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </form>
        </div>
    )
}
