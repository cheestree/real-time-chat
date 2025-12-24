'use client'

import { useOverlay } from '@/components/context/overlay/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import ImageCropper from '@/components/image/ImageCropper'
import { Button, Container, TextField } from '@mui/material'
import { useRef, useState } from 'react'
import { CropperRef } from 'react-advanced-cropper'

export default function ServerCreateForm() {
    const { handleClose } = useOverlay()
    const { createServer, joinServer } = useSocket()
    const [serverId, setServerId] = useState(-1)
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

    return (
        <Container maxWidth="sm">
            <div>
                <div>
                    <h2>Create server</h2>
                    <Button onClick={handleClose}>Close</Button>
                </div>
                <div>
                    <form>
                        <TextField
                            type="number"
                            label="ID"
                            placeholder="Enter ID to join"
                            value={serverId}
                            onChange={(e) =>
                                setServerId(parseInt(e.target.value))
                            }
                            fullWidth
                        />
                        <TextField
                            type="text"
                            label="Name"
                            placeholder="Enter name"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            type="text"
                            label="Description"
                            placeholder="Enter description"
                            value={serverDescription}
                            onChange={(e) =>
                                setServerDescription(e.target.value)
                            }
                            fullWidth
                        />
                        <ImageCropper cropperRef={cropperRef} />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateServer}
                        >
                            Create
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => joinServer(serverId)}
                        >
                            Join
                        </Button>
                    </form>
                </div>
            </div>
        </Container>
    )
}
