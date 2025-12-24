'use client'

import { Dialog } from '@mui/material'
import {
    createContext,
    ReactElement,
    ReactNode,
    useContext,
    useState,
} from 'react'

import styles from '@/components/context/overlay/overlay.module.css'

interface OverlayContextType {
    handleClose: () => void
    handleShow: (modal: ReactElement) => void
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined)

export function OverlayProvider({ children }: { children: ReactNode }) {
    const [show, setShow] = useState(false)
    const [modal, setModal] = useState<ReactElement>()

    const handleClose = () => setShow(false)
    const handleShow = (modal: ReactElement) => {
        setModal(modal)
        setShow(true)
    }

    return (
        <OverlayContext.Provider
            value={{
                handleClose,
                handleShow,
            }}
        >
            <Dialog className={styles.dialog} open={show} onClose={handleClose}>
                {modal}
            </Dialog>
            {children}
        </OverlayContext.Provider>
    )
}

export function useOverlay() {
    const context = useContext(OverlayContext)
    if (context === undefined) {
        throw new Error('useOverlay must be used within a OverlayProvider')
    }
    return context
}
