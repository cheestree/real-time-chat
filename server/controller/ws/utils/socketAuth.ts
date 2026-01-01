import { Socket } from 'socket.io'
import { AuthenticatedUser } from '../../../domain/user/AuthenticatedUser'

export function getAuthenticatedSocketUser(socket: Socket): AuthenticatedUser {
    if (!socket.data.user) {
        throw new Error('Socket is not authenticated')
    }

    const { internalId, publicId, username } = socket.data.user

    return {
        internalId,
        publicId,
        username,
    }
}

export function requireSocketAuthentication(socket: Socket): boolean {
    if (!socket.data.user) {
        socket.emit('error', { message: 'Not authenticated' })
        socket.disconnect()
        return false
    }
    return true
}
