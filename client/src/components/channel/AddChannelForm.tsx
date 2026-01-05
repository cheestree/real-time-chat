'use client'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import { useState } from 'react'

export default function AddChannelForm() {
    const { handleClose } = useOverlay()
    const { createChannel } = useSocket()
    const [channelName, setChannelName] = useState('')
    const [channelDescription, setChannelDescription] = useState('')

    const handleCreateChannel = () => {
        createChannel(channelName, channelDescription)
        handleClose()
    }

    return (
        <div>
            <div>
                <div>
                    <h2>Create channel</h2>
                    <button onClick={handleClose}>Close</button>
                </div>
                <div>
                    <form>
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
                            onChange={(e) =>
                                setChannelDescription(e.target.value)
                            }
                        />
                        <button color="primary" onClick={handleCreateChannel}>
                            Create
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
