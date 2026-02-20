import React from 'react'
import { useLoading } from '../context/LoadingContext'
import styles from './loading.module.css'

export const LoadingOverlay: React.FC = () => {
    const { loading } = useLoading()
    if (!loading) return null
    return (
        <div className={styles.overlay}>
            <div className={styles.loading}>Loading...</div>
        </div>
    )
}
