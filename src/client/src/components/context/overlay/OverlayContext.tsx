'use client'

import { OverlayContextType } from '@/types/overlay.types'
import {
    createContext,
    ReactElement,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import styles from './overlay.module.css'

const OverlayContext = createContext<OverlayContextType | undefined>(undefined)

export function OverlayProvider({ children }: { children: ReactNode }) {
    const [show, setShow] = useState(false)
    const [modal, setModal] = useState<ReactElement>()

    const handleClose = useCallback(() => setShow(false), [])
    
    const handleShow = useCallback((modal: ReactElement) => {
        setModal(modal)
        setShow(true)
    }, [])

    const contextValue = useMemo(
        () => ({
            handleClose,
            handleShow,
        }),
        [handleClose, handleShow]
    )

    return (
        <OverlayContext.Provider value={contextValue}>
            {show && (
                <div className={styles.dialogContent} onClick={handleClose}>
                    <div
                        className={styles.dialogInner}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {modal}
                    </div>
                </div>
            )}
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
