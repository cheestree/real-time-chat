import type { Request } from 'express'
import { Server, Socket } from 'socket.io'
import { NotFoundError } from '../../domain/error/Error'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { ChannelCreateInput } from '../../http/model/input/channel/ChannelCreateInput'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'
import { ServerCreateInput } from '../../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../../http/model/input/server/ServerDeleteInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'
import { UserLeft } from '../../http/model/output/server/UserLeft'
import MessageServices from '../../services/MessageServices'
import ServerServices from '../../services/ServerServices'
import UserServices from '../../services/UserServices'
import { requireOrThrow } from '../../services/utils/requireOrThrow'
import { ClientToServerEvents, ServerToClientEvents } from './events'

function asyncHandlerWrapper<T>(
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

function registerSocketHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    userServices: UserServices,
    serverServices: ServerServices,
    messageServices: MessageServices
) {
    console.log(`Client connected to main`)

    const req = socket.request as Request
    socket.join(req.session.id)

    if (!socket.data.user) {
        socket.emit('error', { message: 'Not authenticated' })
        socket.disconnect()
        return
    }
    const { internalId, publicId, username } = socket.data.user

    const authenticatedUser: AuthenticatedUser = {
        internalId,
        publicId,
        username,
    }

    const createServer = asyncHandlerWrapper<ServerCreateInput>(
        async (data) => {
            const server = await serverServices.createServer(
                authenticatedUser,
                data
            )
            socket.join(`${server.id}`)
            socket.emit('serverCreated', server)
        },
        socket
    )

    const createChannel = asyncHandlerWrapper<ChannelCreateInput>(
        async (data) => {
            const channel = await serverServices.createChannel(
                authenticatedUser,
                data
            )
            io.to(`${data.serverId}`).emit('channelCreated', channel)
        },
        socket
    )

    const messageServer = asyncHandlerWrapper<MessageCreateInput>(
        async (data) => {
            const message = await messageServices.messageChannel(
                authenticatedUser,
                data
            )

            io.to(`${data.serverId}`).emit('messageSent', message)
        },
        socket
    )

    const leaveServer = asyncHandlerWrapper<ServerLeaveInput>(async (data) => {
        const server = await serverServices.leaveServer(authenticatedUser, data)
        const left: UserLeft = {
            serverId: data.id,
            userId: authenticatedUser.publicId,
            username: authenticatedUser.username,
        }

        socket.leave(`${server}`)
        io.to(`${data.id}`).emit('userLeftServer', left)
    }, socket)

    const deleteServer = asyncHandlerWrapper<ServerDeleteInput>(
        async (data) => {
            requireOrThrow(
                NotFoundError,
                await serverServices.serverExists(data.id),
                "Server doesn't exist."
            )
            const usersToNotify = await serverServices.getServerById(data.id)
            await serverServices.deleteServer(authenticatedUser, data)
            usersToNotify!.users.forEach((u) =>
                io.to(`${u}`).emit('serverDeleted', data.id)
            )
            socket.leave(`${data.id}`)
            io.to(`${data.id}`).emit('serverDeleted', data.id)
        },
        socket
    )

    const disconnect = asyncHandlerWrapper(async () => {
        console.log(`Client disconnected from main`)
        socket.disconnect()
    }, socket)

    socket.on('createServer', createServer)
    socket.on('createChannel', createChannel)
    socket.on('messageServer', messageServer)
    socket.on('leaveServer', leaveServer)
    socket.on('deleteServer', deleteServer)
    socket.on('disconnect', disconnect)
}

export default registerSocketHandlers
