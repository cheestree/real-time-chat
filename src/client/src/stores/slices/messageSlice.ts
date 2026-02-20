import { messageService } from '@/services/MessageService'
import { socketService } from '@/services/SocketService'
import { StateCreator } from 'zustand'
import { MessageState, SocketState } from '../types/socketStore.types'

export const createMessageSlice: StateCreator<
    SocketState,
    [['zustand/immer', never], ['zustand/devtools', never]],
    [],
    Pick<SocketState, keyof MessageState>
> = (set, get) => ({
    // State
    fetchedMessages: new Set(),

    // Setters
    addFetchedMessage: (key) => {
        set((state) => {
            state.fetchedMessages.add(key)
        })
    },

    clearFetchedMessages: () => {
        set((state) => {
            state.fetchedMessages = new Set()
        })
    },

    addMessageToChannel: (channelId, message) => {
        set((state) => {
            for (const server of state.servers) {
                const channel = server.channels.find((c) => c.id === channelId)
                if (channel) {
                    if (!channel.messages) channel.messages = []
                    const messageExists = channel.messages.some(
                        (m) => m.id === message.id
                    )
                    if (!messageExists) {
                        channel.messages.push(message)
                    }
                    if (state.currentChannelId === channelId) {
                        state.currentChannel = channel
                    }
                    break
                }
            }
        })
    },

    messageServer: (content) => {
        const { currentServerId, currentChannelId } = get()
        if (!currentServerId || !currentChannelId) return
        socketService.messageServer({
            serverId: currentServerId,
            channelId: currentChannelId,
            content,
        })
    },

    getPagedMessages: async (serverId, channelId, limit, nextPageState) => {
        const result = await messageService.getPagedMessages({
            serverId,
            channelId,
            limit,
            nextPageState,
        })

        if (result.success) {
            const {
                messages,
                nextPageState: newPageState,
                hasMore,
            } = result.data

            set((state) => {
                const server = state.servers.find((s) => s.id === serverId)
                const channel = server?.channels.find((c) => c.id === channelId)
                if (channel) {
                    if (!channel.messages) channel.messages = []
                    const existingMessageIds = new Set(
                        channel.messages.map((m) => m.id)
                    )
                    const newMessages = messages.filter(
                        (m) => !existingMessageIds.has(m.id)
                    )
                    channel.messages.push(...newMessages)
                    channel.messages.sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime()
                    )
                    // Update currentChannel if this is the active channel
                    if (state.currentChannelId === channelId) {
                        state.currentChannel = channel
                    }
                }
            })

            return {
                messages,
                nextPageState: newPageState,
                hasMore,
            }
        }
        return { messages: [], nextPageState: undefined, hasMore: false }
    },
})
