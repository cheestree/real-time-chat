import { Conversation, DirectMessage } from '@/domain/DirectMessage'
import { directMessageService } from '@/services/DirectMessageService'
import { socketService } from '@/services/SocketService'
import { StateCreator } from 'zustand'
import { DirectMessageState, SocketState } from '../types/socketStore.types'

export const createDirectMessageSlice: StateCreator<
    SocketState,
    [['zustand/immer', never], ['zustand/devtools', never]],
    [],
    Pick<SocketState, keyof DirectMessageState>
> = (set, get) => ({
    // State
    conversations: [],
    currentRecipientId: null,
    currentConversation: undefined,

    // Setters
    setConversations: (conversations) => {
        set((state) => {
            state.conversations = conversations
        })
    },

    setCurrentRecipientId: (id) => {
        set((state) => {
            state.currentRecipientId = id
            if (id) {
                const conversation = state.conversations.find(
                    (c) => c.otherUserId === id
                )
                state.currentConversation = conversation
            } else {
                state.currentConversation = undefined
            }
        })
    },

    addMessageToConversation: (otherUserId, otherUsername, message) => {
        set((state) => {
            let conversation = state.conversations.find(
                (c) => c.otherUserId === otherUserId
            )

            // Create conversation if it doesn't exist
            if (!conversation) {
                conversation = {
                    id: otherUserId,
                    otherUserId,
                    otherUsername: otherUsername || 'Unknown User',
                    messages: [],
                    lastMessage: message,
                    lastMessageTimestamp: message.timestamp,
                }
                state.conversations.push(conversation)
            }

            if (!conversation.messages) conversation.messages = []
            const messageExists = conversation.messages.some(
                (m) => m.id === message.id
            )
            if (!messageExists) {
                conversation.messages.push(message)
                conversation.lastMessage = message
                conversation.lastMessageTimestamp = message.timestamp
            }

            if (state.currentRecipientId === otherUserId) {
                state.currentConversation = conversation
            }
        })
    },

    getUserConversations: async () => {
        // Not needed - conversations are created on-demand when messages are received
        // or when users click on other users to start a DM
        // TODO: Implement a "recent conversations" API if we want to show a list of past DMs
        set((state) => {
            state.conversations = []
        })
    },

    messageDM: (recipientId: string, content: string) => {
        socketService.messageDM({
            recipientId,
            content,
        })
    },

    joinDM: (recipientId: string) => {
        socketService.joinDM({ recipientId })
    },

    leaveDM: (recipientId: string) => {
        socketService.leaveDM({ recipientId })
    },

    switchToServerMode: () => {
        set((state) => {
            // Clear DM state
            state.currentRecipientId = null
            state.currentConversation = undefined

            // Restore last server/channel if available
            if (state.servers.length > 0) {
                // Find the most recently viewed server, or use the first one
                const lastServerId =
                    state.currentServerId || state.servers[0]?.id
                const server = state.servers.find((s) => s.id === lastServerId)

                if (server) {
                    state.currentServerId = server.id
                    state.currentServer = server

                    // Get last viewed channel for this server
                    const lastChannelId =
                        state.lastViewedChannelByServer[server.id]
                    const channel =
                        server.channels?.find((c) => c.id === lastChannelId) ||
                        server.channels?.[0]

                    if (channel) {
                        state.currentChannelId = channel.id
                        state.currentChannel = channel
                    }
                }
            }
        })
    },

    changeConversation: async (
        recipientId: string,
        recipientUsername?: string
    ) => {
        // Fetch user info if needed
        const existingConversation = get().conversations.find(
            (c) => c.otherUserId === recipientId
        )

        if (!existingConversation) {
            // Create a new conversation entry
            set((state) => {
                state.conversations.push({
                    id: recipientId,
                    otherUserId: recipientId,
                    otherUsername: recipientUsername || 'User',
                    messages: [],
                })
            })
        }

        set((state) => {
            state.currentRecipientId = recipientId
            const conversation = state.conversations.find(
                (c) => c.otherUserId === recipientId
            )
            state.currentConversation = conversation
        })

        const room = `dm_${recipientId}`
        if (!socketService.getJoinedDMRooms().has(room)) {
            await get().getDirectMessages(recipientId, 50)
            set((state) => {
                const conversation = state.conversations.find(
                    (c) => c.otherUserId === recipientId
                )
                state.currentConversation = conversation
            })
            socketService.joinDM({ recipientId })
        }
    },

    getDirectMessages: async (
        recipientId: string,
        limit: number,
        nextPageState?: string
    ) => {
        const response = await directMessageService.getDirectMessages(
            recipientId,
            limit,
            nextPageState
        )

        if (response.success) {
            const messages: DirectMessage[] = response.data.messages.map(
                (m: any) => ({
                    id: m.id,
                    senderId: m.authorId,
                    recipientId: recipientId,
                    content: m.content,
                    timestamp: m.timestamp,
                    authorUsername: m.authorUsername,
                    authorIcon: m.authorIcon,
                })
            )

            set((state) => {
                let conversation = state.conversations.find(
                    (c) => c.otherUserId === recipientId
                )
                if (!conversation) {
                    const newConversation: Conversation = {
                        id: recipientId,
                        otherUserId: recipientId,
                        otherUsername: '',
                        messages: messages,
                    }
                    state.conversations.push(newConversation)
                } else {
                    const existingMessageIds = new Set(
                        (conversation.messages || []).map((m) => m.id)
                    )
                    const newMessages = messages.filter(
                        (m) => !existingMessageIds.has(m.id)
                    )
                    conversation.messages = [
                        ...(conversation.messages || []),
                        ...newMessages,
                    ].sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime()
                    )
                }

                if (state.currentRecipientId === recipientId) {
                    state.currentConversation = state.conversations.find(
                        (c) => c.otherUserId === recipientId
                    )
                }
            })

            return {
                messages,
                nextPageState: response.data.nextPageState,
                hasMore: response.data.hasMore,
            }
        }

        return { messages: [], nextPageState: undefined, hasMore: false }
    },
})
