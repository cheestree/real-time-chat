import { Socket } from 'socket.io'

export function asyncSocketHandler<T>(
    handler: (data: T) => Promise<void>,
    socket: Socket,
    onError?: (error: unknown, data?: T) => void
) {
    return async (data: T) => {
        try {
            await handler(data)
        } catch (error) {
            if (onError) {
                onError(error, data)
            } else {
                const errorMessage = (error as Error).message
                socket.emit('error', { message: errorMessage })
            }
        }
    }
}
