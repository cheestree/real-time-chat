import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createChannelSlice } from './slices/channelSlice'
import { createDirectMessageSlice } from './slices/directMessageSlice'
import { createMessageSlice } from './slices/messageSlice'
import { createServerSlice } from './slices/serverSlice'
import { SocketState } from './types/socketStore.types'

export const useSocketStore = create<SocketState>()(
    devtools(
        immer((...a) => ({
            ...createServerSlice(...a),
            ...createChannelSlice(...a),
            ...createMessageSlice(...a),
            ...createDirectMessageSlice(...a),
        })),
        { name: 'SocketStore' }
    )
)

// Convenience selectors
export const useCurrentServer = () =>
    useSocketStore((state) => state.currentServer)
export const useCurrentChannel = () =>
    useSocketStore((state) => state.currentChannel)
export const useServers = () => useSocketStore((state) => state.servers)
export const useCurrentServerId = () =>
    useSocketStore((state) => state.currentServerId)
export const useCurrentChannelId = () =>
    useSocketStore((state) => state.currentChannelId)
