'use client'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import { useState } from 'react'

import styles from './form.module.css'

export default function ChannelCreateForm() {
    const { handleClose } = useOverlay()
    const { createChannel } = useSocket()
    const [channelName, setChannelName] = useState('')
    const [channelDescription, setChannelDescription] = useState('')

    const handleCreateChannel = () => {
        createChannel(channelName, channelDescription)
        handleClose()
    }

    return (
        <div className={styles.container}>
            <form className={styles.form}>
                <input
                    type="text"
                    placeholder="Enter name of the channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter description of the channel"
                    value={channelDescription}
                    onChange={(e) => setChannelDescription(e.target.value)}
                />
                <div className={styles.actions}>
                    <button onClick={handleCreateChannel}>Create</button>
                    <button onClick={handleClose}>Close</button>
                </div>
            </form>
        </div>
    )
}
