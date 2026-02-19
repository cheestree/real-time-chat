import {
    ChannelJoinInput,
    ChannelJoinSchema,
    ChannelLeaveInput,
    ChannelLeaveSchema,
    DirectMessageCreateInput,
    DirectMessageCreateSchema,
    MessageCreateInput,
    MessageCreateSchema,
    ServerJoinInput,
    ServerJoinSchema,
    ServerLeaveInput,
    ServerLeaveSchema,
} from '@rtchat/shared'
import { Server, Socket } from 'socket.io'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import DirectMessageService from '../../services/DirectMessageService'
import MessageService from '../../services/MessageService'
import ServerService from '../../services/ServerService'
import { logger } from '../../utils/logger'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './events'
import { asyncSocketHandler } from './utils/asyncSocketHandler'

type UserLeft = {
    serverId: string
    profile: { id: string; username: string }
}

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
        private serverServices: ServerService,
        private messageServices: MessageService,
        private dmServices: DirectMessageService,
        private authenticatedUser: AuthenticatedUser
    ) {}

    private joinedChannelRooms: Set<string> = new Set()
    private joinedServerRooms: Set<string> = new Set()
    private joinedDMRooms: Set<string> = new Set()

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
            authorUsername: message.authorUsername,
            authorIcon: message.authorIcon,
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

    messageDM = asyncSocketHandler<DirectMessageCreateInput>(async (data) => {
        const validatedData = DirectMessageCreateSchema.parse(data)

        const message = await this.dmServices.sendDirectMessage(
            this.authenticatedUser,
            validatedData
        )

        const recipientRoom = `user_${validatedData.recipientId}`
        const senderRoom = `user_${this.authenticatedUser.publicId}`

        const dmMessage = {
            id: message.id,
            authorId: message.authorId,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            recipientId: validatedData.recipientId,
            senderId: this.authenticatedUser.publicId,
            authorUsername: message.authorUsername,
            authorIcon: message.authorIcon,
        }

        // Send message to both users
        this.io.to(recipientRoom).emit('dmSent', dmMessage)
        this.io.to(senderRoom).emit('dmSent', dmMessage)

        // Send notification to recipient for UI alerts/toasts
        this.io.to(recipientRoom).emit('dmNotification', {
            senderId: this.authenticatedUser.publicId,
            senderUsername: this.authenticatedUser.profile.username,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
        })
    }, this.socket)

    joinDM = asyncSocketHandler<{ recipientId: string }>(async (data) => {
        const newRoom = `dm_${data.recipientId}`

        if (this.joinedDMRooms.has(newRoom)) {
            logger.info(
                `Socket ${this.socket.id} already in DM room ${newRoom}`
            )
            return
        }
        this.socket.join(newRoom)
        this.joinedDMRooms.add(newRoom)
        logger.info(`Socket ${this.socket.id} joined DM room ${newRoom}`)
    }, this.socket)

    leaveDM = asyncSocketHandler<{ recipientId: string }>(async (data) => {
        const room = `dm_${data.recipientId}`

        if (this.joinedDMRooms.has(room)) {
            this.socket.leave(room)
            this.joinedDMRooms.delete(room)
            logger.info(`Socket ${this.socket.id} left DM room ${room}`)
        } else {
            logger.info(
                `Socket ${this.socket.id} not in DM room ${room}, cannot leave.`
            )
        }
    }, this.socket)
}
