import { useOverlay } from '@/components/context/OverlayContext'
import { Button } from '@mui/material'
import { ReactElement } from 'react'

import styles from './createChannel.module.css'

export default function CreateChannel({ form }: { form: ReactElement }) {
    const { handleShow } = useOverlay()

    return (
        <div className={styles.addChannel}>
            <Button onClick={() => handleShow(form)}>Add channel</Button>
        </div>
    )
}
