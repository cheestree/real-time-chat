import { Server, Socket } from 'socket.io'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import {
    ChannelJoinInput,
    ChannelJoinSchema,
} from '../../http/model/input/channel/ChannelJoinInput'
import {
    ChannelLeaveInput,
    ChannelLeaveSchema,
} from '../../http/model/input/channel/ChannelLeaveInput'
import {
    MessageCreateInput,
    MessageCreateSchema,
} from '../../http/model/input/message/MessageCreateInput'
import {
    ServerJoinInput,
    ServerJoinSchema,
} from '../../http/model/input/server/ServerJoinInput'
import {
    ServerLeaveInput,
    ServerLeaveSchema,
} from '../../http/model/input/server/ServerLeaveInput'
import { UserLeft } from '../../http/model/output/server/UserLeft'
import MessageServices from '../../services/MessageServices'
import ServerServices from '../../services/ServerServices'
import { logger } from '../../utils/logger'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './events'
import { asyncSocketHandler } from './utils/asyncSocketHandler'

export class SocketManager {
    constructor(
        private io: Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >,
        private socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >,
        private serverServices: ServerServices,
        private messageServices: MessageServices,
        private authenticatedUser: AuthenticatedUser
    ) {}

    private joinedChannelRooms: Set<string> = new Set()
    private joinedServerRooms: Set<string> = new Set()

    messageServer = asyncSocketHandler<MessageCreateInput>(async (data) => {
        const validatedData = MessageCreateSchema.parse(data)

        const message = await this.messageServices.sendMessage(
            this.authenticatedUser,
            validatedData
        )

        const target = `channel_${validatedData.channelId}`

        this.io.to(target).emit('messageSent', {
            id: message.id,
            authorId: message.authorId,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            serverId: validatedData.serverId,
            channelId: validatedData.channelId,
        })
    }, this.socket)

    leaveServer = asyncSocketHandler<ServerLeaveInput>(async (data) => {
        const validatedData = ServerLeaveSchema.parse(data)

        await this.serverServices.leaveServer(
            this.authenticatedUser,
            validatedData
        )
        const left: UserLeft = {
            serverId: validatedData.serverId,
            profile: this.authenticatedUser.profile,
        }

        this.socket.leave(validatedData.serverId)
        this.io.to(validatedData.serverId).emit('userLeftServer', left)
    }, this.socket)

    joinChannel = asyncSocketHandler<ChannelJoinInput>(async (data) => {
        const validatedData = ChannelJoinSchema.parse(data)
        const newRoom = `channel_${validatedData.channelId}`

        if (this.joinedChannelRooms.has(newRoom)) {
            logger.info(
                `Socket ${this.socket.id} already in channel room ${newRoom}`
            )
            return
        }
        this.socket.join(newRoom)
        this.joinedChannelRooms.add(newRoom)
        logger.info(`Socket ${this.socket.id} joined channel room ${newRoom}`)
    }, this.socket)

    leaveChannel = asyncSocketHandler<ChannelLeaveInput>(async (data) => {
        const validatedData = ChannelLeaveSchema.parse(data)
        const room = `channel_${validatedData.channelId}`

        if (this.joinedChannelRooms.has(room)) {
            this.socket.leave(room)
            this.joinedChannelRooms.delete(room)
            logger.info(`Socket ${this.socket.id} left channel room ${room}`)
        } else {
            logger.info(
                `Socket ${this.socket.id} not in channel room ${room}, cannot leave.`
            )
        }
    }, this.socket)

    joinServer = asyncSocketHandler<ServerJoinInput>(async (data) => {
        const validatedData = ServerJoinSchema.parse(data)
        const newRoom = `server_${validatedData.serverId}`

        if (this.joinedServerRooms.has(newRoom)) {
            logger.info(
                `Socket ${this.socket.id} already in server room ${newRoom}`
            )
            return
        }

        this.socket.join(newRoom)
        this.joinedServerRooms.add(newRoom)
        logger.info(`Socket ${this.socket.id} joined server room ${newRoom}`)
    }, this.socket)

    disconnect = asyncSocketHandler(async () => {
        logger.info(`Client disconnected from main`)
        this.socket.disconnect()
    }, this.socket)
}
