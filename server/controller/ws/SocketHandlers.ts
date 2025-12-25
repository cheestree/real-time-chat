import type { Request } from 'express'
import { Server, Socket } from 'socket.io'
import { Message } from '../../domain/message/Message'
import { Credentials } from '../../domain/user/Credentials'
import { UserProfile } from '../../domain/user/UserProfile'
import { SocketEvent } from '../../http/events/SocketEvent'
import serverServices from '../../services/ServerServices'
import userServices from '../../services/UserServices'

const SocketHandlers = (
    io: Server,
    socket: Socket,
    userServices: userServices,
    serverServices: serverServices
) => {
    console.log(`Client connected to main`)

    const req = socket.request as Request
    socket.join(req.session.id)

    const id = socket.id
    const credentials: Credentials = socket.data
    const user: UserProfile = {
        id: credentials.id,
        username: credentials.username,
    }

    const sendUserServers = async () => {
        try {
            const userServers = await serverServices.getUserServers(user)
            userServers.forEach((server) => {
                socket.join(`${server.id}`)
            })
            io.to(id).emit(SocketEvent.USER_SERVERS_SUCCESS, userServers)
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.USER_SERVERS_ERROR, errorMessage)
        }
    }
    const createServer = async function (data: {
        serverName: string
        serverDescription: string
        serverIcon: string
    }) {
        try {
            const { serverName, serverDescription, serverIcon } = data

            const server = await serverServices.createServer(
                serverName,
                serverDescription,
                user,
                serverIcon
            )

            socket.join(`${server.id}`)
            io.to(id).emit(SocketEvent.CREATE_SERVER_SUCCESS, server)
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.CREATE_SERVER_ERROR, errorMessage)
        }
    }
    const joinServer = async function (data: { serverId: number }) {
        try {
            const { serverId } = data

            const serverFound = await serverServices.addUserToServer(
                serverId,
                user
            )

            socket.join(`${serverFound.id}`)
            io.to(`${serverFound.id}`).emit(SocketEvent.MEMBER_JOINED, {
                user: { id: credentials.id, username: credentials.username },
                serverId: serverFound.id,
            })
            io.to(id).emit(SocketEvent.JOIN_SERVER_SUCCESS, serverFound)
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.JOIN_SERVER_ERROR, errorMessage)
        }
    }
    const createChannel = async function (data: {
        serverId: number
        channelName: string
        channelDescription: string
    }) {
        try {
            const { serverId, channelName, channelDescription } = data

            const channel = await serverServices.createChannel(
                serverId,
                channelName,
                channelDescription
            )

            io.to(`${serverId}`).emit(SocketEvent.CREATE_CHANNEL_SUCCESS, {
                serverId: serverId,
                channel: channel,
            })
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.CREATE_CHANNEL_ERROR, errorMessage)
        }
    }
    const messageServer = async function (data: {
        serverId: number
        channelId: number
        message: string
    }) {
        try {
            const { serverId, channelId, message } = data

            const newMessage: Message = {
                author: user.username,
                message: message,
            }
            await serverServices.messageChannel(serverId, channelId, newMessage)

            io.to(`${serverId}`).emit(SocketEvent.MESSAGE_SERVER_SUCCESS, {
                serverId: serverId,
                channelId: channelId,
                message: newMessage,
            })
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.MESSAGE_SERVER_ERROR, errorMessage)
        }
    }
    const leaveServer = async function (data: { serverId: number }) {
        try {
            const { serverId } = data
            console.log('Server ID to leave: ' + serverId)
            const server = await serverServices.leaveServer(serverId, user)

            socket.leave(`${server}`)
            io.to(id).emit(
                SocketEvent.LEAVE_SERVER_SUCCESS,
                'Left successfully'
            )
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.LEAVE_SERVER_ERROR, errorMessage)
        }
    }
    const deleteServer = async function (data: { serverId: number }) {
        try {
            const { serverId } = data
            console.log('Server ID to delete: ' + serverId)
            const server = await serverServices.deleteServer(serverId, user)

            server.forEach((u) =>
                io
                    .to(`${u.id}`)
                    .emit(SocketEvent.DELETE_SERVER_SUCCESS, serverId)
            )

            socket.leave(`${serverId}`)
            io.to(id).emit(SocketEvent.DELETE_SERVER_SUCCESS, serverId)
        } catch (error: unknown) {
            const errorMessage: string = (error as Error).message
            io.to(id).emit(SocketEvent.DELETE_SERVER_ERROR, errorMessage)
        }
    }
    const disconnect = async function () {
        console.log(`Client disconnected from main`)
    }

    socket.on(SocketEvent.USER_SERVERS, sendUserServers)
    socket.on(SocketEvent.CREATE_SERVER, createServer)
    socket.on(SocketEvent.JOIN_SERVER, joinServer)
    socket.on(SocketEvent.CREATE_CHANNEL, createChannel)
    socket.on(SocketEvent.MESSAGE_SERVER, messageServer)
    socket.on(SocketEvent.LEAVE_SERVER, leaveServer)
    socket.on(SocketEvent.DELETE_SERVER, deleteServer)
    socket.on(SocketEvent.DISCONNECT, disconnect)
}

export default SocketHandlers
