import { Socket } from 'socket.io'
import { AuthenticatedUser } from '../../../domain/user/AuthenticatedUser'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from '../events'

type AuthenticatedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>

export function getAuthenticatedSocketUser(
    socket: AuthenticatedSocket
): AuthenticatedUser {
    if (!socket.data.user) {
        throw new Error('Socket is not authenticated')
    }

    const { internalId, publicId, profile } = socket.data.user

    return {
        internalId,
        publicId,
        profile,
    }
}

export function requireSocketAuthentication(
    socket: AuthenticatedSocket
): boolean {
    if (!socket.data.user) {
        socket.emit('error', { message: 'Not authenticated' })
        socket.disconnect()
        return false
    }
    return true
}
