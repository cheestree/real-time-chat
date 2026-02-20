'use client'

import { useOverlayStore } from '@/stores/useOverlayStore'
import { useSocketStore } from '@/stores/useSocketStore'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { CropperRef } from 'react-advanced-cropper'
import styles from './serverCreateForm.module.css'

const ImageCropper = dynamic(() => import('@/components/image/ImageCropper'), {
    ssr: false,
    loading: () => <div>Loading cropper...</div>,
})

export default function ServerCreateForm() {
    const close = useOverlayStore((state) => state.close)
    const createServer = useSocketStore((state) => state.createServer)
    const joinServer = useSocketStore((state) => state.joinServer)
    const cropperRef = useRef<CropperRef | null>(null)

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
        close()
    }

    const handleJoinServer = (formData: FormData) => {
        const serverId = (formData.get('serverId') as string)?.trim()
        if (!serverId) return
        joinServer(serverId)
        close()
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
                {/**<ImageCropper cropperRef={cropperRef} />**/}
                <div className={styles.actions}>
                    <button type="submit">Create</button>
                    <button type="button" onClick={close}>
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
