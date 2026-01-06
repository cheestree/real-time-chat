import { ReactElement } from 'react'

export interface OverlayContextType {
    handleClose: () => void
    handleShow: (modal: ReactElement) => void
}
