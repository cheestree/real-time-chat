import { Server, Socket } from 'socket.io'
import MessageServices from '../../services/MessageService'
import ServerServices from '../../services/ServerService'
import UserServices from '../../services/UserService'
import { logger } from '../../utils/logger'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './events'
import { SocketManager } from './SocketManager'
import {
    getAuthenticatedSocketUser,
    requireSocketAuthentication,
} from './utils/socketAuth'

function registerSocketHandlers(
    io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,
    userServices: UserServices,
    serverServices: ServerServices,
    messageServices: MessageServices
) {
    if (!requireSocketAuthentication(socket)) {
        return
    }

    logger.info(`Client ${socket.id} connected to main`)

    const authenticatedUser = getAuthenticatedSocketUser(socket)
    socket.join(`user_${authenticatedUser.internalId}`)

    const manager = new SocketManager(
        io,
        socket,
        serverServices,
        messageServices,
        authenticatedUser
    )

    socket.on('messageServer', manager.messageServer)
    socket.on('leaveServer', manager.leaveServer)
    socket.on('disconnect', manager.disconnect)
    socket.on('joinChannel', manager.joinChannel)
    socket.on('joinServer', manager.joinServer)
    socket.on('leaveChannel', manager.leaveChannel)
}

export default registerSocketHandlers
