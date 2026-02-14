'use client'

import { useOverlayStore } from '@/stores/useOverlayStore'
import styles from './context/overlay.module.css'

export function OverlayRenderer() {
    const isVisible = useOverlayStore((state) => state.isVisible)
    const modal = useOverlayStore((state) => state.modal)
    const close = useOverlayStore((state) => state.close)

    if (!isVisible) return null

    return (
        <div className={styles.dialogContent} onClick={close}>
            <div
                className={styles.dialogInner}
                onClick={(e) => e.stopPropagation()}
            >
                {modal}
            </div>
        </div>
    )
}
