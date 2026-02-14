'use client'

import { useOverlayStore } from '@/stores/useOverlayStore'
import { useSocketStore } from '@/stores/useSocketStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import styles from './form.module.css'

const channelSchema = z.object({
    channelName: z.string().min(1, 'Channel name is required').max(100),
    channelDescription: z.string().max(500).optional(),
})

type ChannelFormData = z.infer<typeof channelSchema>

export default function ChannelCreateForm() {
    const close = useOverlayStore((state) => state.close)
    const createChannel = useSocketStore((state) => state.createChannel)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ChannelFormData>({
        resolver: zodResolver(channelSchema),
    })

    const onSubmit = async (data: ChannelFormData) => {
        await createChannel(data.channelName, data.channelDescription || '')
        close()
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div>
                    <input
                        type="text"
                        placeholder="Enter name of the channel"
                        {...register('channelName')}
                    />
                    {errors.channelName && (
                        <span style={{ color: 'red', fontSize: '0.875rem' }}>
                            {errors.channelName.message}
                        </span>
                    )}
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Enter description of the channel"
                        {...register('channelDescription')}
                    />
                    {errors.channelDescription && (
                        <span style={{ color: 'red', fontSize: '0.875rem' }}>
                            {errors.channelDescription.message}
                        </span>
                    )}
                </div>
                <div className={styles.actions}>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                    <button type="button" onClick={close}>
                        Close
                    </button>
                </div>
            </form>
        </div>
    )
}
