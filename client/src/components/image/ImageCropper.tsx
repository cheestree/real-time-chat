import React, { ChangeEvent, RefObject, useRef, useState } from 'react'
import {
    CircleStencil,
    Cropper,
    CropperPreviewRef,
    CropperRef,
} from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'

import styles from './image.module.css'

export default function ImageCropper({
    cropperRef,
}: {
    cropperRef: RefObject<CropperRef>
}) {
    const previewRef = useRef<CropperPreviewRef>(null)
    const [src, setSrc] = useState('')

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            alert('Please select an image file.')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target && event.target.result) {
                const newSrc = event.target.result.toString()
                setSrc(newSrc)
                cropperRef.current?.reset()
            }
        }
        reader.readAsDataURL(file)
    }

    const onUpdate = () => {
        previewRef.current?.refresh()
    }

    const onClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        cropperRef.current?.reset()
        setSrc('')
    }

    return (
        <div className={styles.imageContainer}>
            <div className={styles.cropper}>
                <Cropper
                    ref={cropperRef}
                    className={styles.cropper}
                    stencilProps={{
                        aspectRatio: 1,
                    }}
                    src={src}
                    onUpdate={onUpdate}
                    stencilComponent={CircleStencil}
                />
            </div>
            <label className={styles.customFileButton}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.input}
                />
                Upload image
            </label>
            <button onClick={onClear}>Clear</button>
        </div>
    )
}
