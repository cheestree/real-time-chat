'use client'

import { useOverlayStore } from '@/stores/useOverlayStore'
import { useSocketStore } from '@/stores/useSocketStore'

import styles from './form.module.css'

export default function ChannelCreateForm() {
    const close = useOverlayStore((state) => state.close)
    const createChannel = useSocketStore((state) => state.createChannel)

    const handleCreateChannel = (formData: FormData) => {
        const channelName = formData.get('channelName') as string
        const channelDescription = formData.get('channelDescription') as string
        createChannel(channelName, channelDescription)
        close()
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
                    <button type="button" onClick={close}>
                        Close
                    </button>
                </div>
            </form>
        </div>
    )
}
