import { ChannelDetail, ServerDetail } from '@rtchat/shared'

/**
 * Syncs the current server reference in state
 */
export function syncCurrentServer(
    state: { servers: ServerDetail[] },
    serverId: string | null
): ServerDetail | undefined {
    if (!serverId) return undefined
    return state.servers.find((s) => s.id === serverId)
}

/**
 * Syncs the current channel reference in state
 */
export function syncCurrentChannel(
    server: ServerDetail | undefined,
    channelId: string | null
): ChannelDetail | undefined {
    if (!channelId || !server) return undefined
    return server.channels?.find((c) => c.id === channelId)
}

/**
 * Finds the next available server after one is removed
 */
export function findNextAvailableServer(
    servers: ServerDetail[],
    excludeId?: string
): ServerDetail | undefined {
    return servers.find((s) => s.id !== excludeId)
}

/**
 * Finds the last viewed channel for a server, or the first channel if none
 */
export function findLastViewedOrFirstChannel(
    server: ServerDetail,
    lastViewedMap: Record<string, string>
): ChannelDetail | undefined {
    const lastViewedChannelId = lastViewedMap[server.id]
    const lastViewedChannel = server.channels?.find(
        (c) => c.id === lastViewedChannelId
    )
    return lastViewedChannel || server.channels?.[0]
}

/**
 * Ensures server has required arrays initialized
 */
export function ensureServerArrays(server: ServerDetail): void {
    if (!server.channels) server.channels = []
    if (!server.users) server.users = []
}

/**
 * Ensures channel has required arrays initialized
 */
export function ensureChannelArrays(channel: ChannelDetail): void {
    if (!channel.messages) channel.messages = []
}
