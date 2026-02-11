'use client'

import React, {
    ChangeEvent,
    RefObject,
    useCallback,
    useRef,
    useState,
} from 'react'
import {
    CircleStencil,
    Cropper,
    CropperPreviewRef,
    CropperRef,
} from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'

import styles from './image.module.css'

type ImageCropperProps = {
    cropperRef: RefObject<CropperRef>
}

export default function ImageCropper({ cropperRef }: ImageCropperProps) {
    const previewRef = useRef<CropperPreviewRef>(null)
    const [src, setSrc] = useState('')

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
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
        },
        [cropperRef]
    )

    const onUpdate = useCallback(() => {
        previewRef.current?.refresh()
    }, [])

    const onClear = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            cropperRef.current?.reset()
            setSrc('')
        },
        [cropperRef]
    )

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
