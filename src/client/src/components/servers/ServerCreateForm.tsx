'use client'

import { useOverlay } from '@/components/context/OverlayContext'
import { useSocket } from '@/components/context/SocketContext'
import ImageCropper from '@/components/image/ImageCropper'
import { useRef } from 'react'
import { CropperRef } from 'react-advanced-cropper'
import styles from './serverCreateForm.module.css'

export default function ServerCreateForm() {
    const { handleClose } = useOverlay()
    const { createServer, joinServer } = useSocket()
    const cropperRef = useRef<CropperRef>(null)

    const handleCreateServer = (formData: FormData) => {
        const serverName = formData.get('serverName') as string
        const serverDescription = formData.get('serverDescription') as string

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

    const handleJoinServer = (formData: FormData) => {
        const serverId = (formData.get('serverId') as string)?.trim()
        if (!serverId) return
        joinServer(serverId)
        handleClose()
    }

    return (
        <div className={styles.container}>
            <form action={handleCreateServer} className={styles.form}>
                <input
                    type="text"
                    name="serverName"
                    placeholder="Enter name"
                    required
                />
                <input
                    type="text"
                    name="serverDescription"
                    placeholder="Enter description"
                />
                <ImageCropper cropperRef={cropperRef} />
                <div className={styles.actions}>
                    <button type="submit">Create</button>
                    <button type="button" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </form>
            <form action={handleJoinServer} className={styles.form}>
                <input
                    type="text"
                    name="serverId"
                    placeholder="Enter ID to join"
                    required
                />
                <div className={styles.actions}>
                    <button type="submit">Join</button>
                </div>
            </form>
        </div>
    )
}
