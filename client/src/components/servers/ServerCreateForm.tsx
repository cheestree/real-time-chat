'use client'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import ImageCropper from '@/components/image/ImageCropper'
import { useRef, useState } from 'react'
import { CropperRef } from 'react-advanced-cropper'

export default function ServerCreateForm() {
    const { handleClose } = useOverlay()
    const { createServer, joinServer } = useSocket()
    const [serverId, setServerId] = useState('')
    const [serverName, setServerName] = useState('')
    const [serverDescription, setServerDescription] = useState('')
    const cropperRef = useRef<CropperRef>(null)

    const handleCreateServer = () => {
        let iconDataUrl = ''
        const canvas = cropperRef.current?.getCanvas()
        if (canvas) {
            const resizedCanvas = document.createElement('canvas')
            const ctx = resizedCanvas.getContext('2d')
            if (ctx) {
                resizedCanvas.width = 512
                resizedCanvas.height = 512
                ctx.drawImage(
                    canvas,
                    0,
                    0,
                    resizedCanvas.width,
                    resizedCanvas.height
                )
                iconDataUrl = resizedCanvas.toDataURL()
            }
        }

        createServer(serverName, serverDescription, iconDataUrl)
        handleClose()
    }

    const handleJoinServer = () => {
        const trimmedId = serverId.trim()
        if (!trimmedId) return
        joinServer(trimmedId)
        handleClose()
    }

    return (
        <div>
            <div>
                <div>
                    <h2>Create server</h2>
                    <button onClick={handleClose}>Close</button>
                </div>
                <div>
                    <form>
                        <input
                            type="string"
                            placeholder="Enter ID to join"
                            value={serverId}
                            onChange={(e) => {
                                setServerId(e.target.value)
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Enter name"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Enter description"
                            value={serverDescription}
                            onChange={(e) =>
                                setServerDescription(e.target.value)
                            }
                        />
                        <ImageCropper cropperRef={cropperRef} />
                        <button color="primary" onClick={handleCreateServer}>
                            Create
                        </button>
                        <button color="primary" onClick={handleJoinServer}>
                            Join
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
