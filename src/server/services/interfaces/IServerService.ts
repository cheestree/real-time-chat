import { Channel } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { ChannelCreateInput } from '../../http/model/input/channel/ChannelCreateInput'
import { ServerCreateInput } from '../../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../../http/model/input/server/ServerDeleteInput'
import { ServerExistsInput } from '../../http/model/input/server/ServerExistsInput'
import { ServerJoinInput } from '../../http/model/input/server/ServerJoinInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'
import { UserServersInput } from '../../http/model/input/server/UserServersInput'
import { ServerDetail } from '../../http/model/output/server/ServerDetail'

interface IServerService {
    getUserServers: (input: UserServersInput) => Promise<ServerDetail[]>
    getServerById: (serverId: string) => Promise<Server>
    serverExists: (input: ServerExistsInput) => Promise<boolean>
    createServer: (
        user: AuthenticatedUser,
        input: ServerCreateInput
    ) => Promise<ServerDetail>
    createChannel: (
        user: AuthenticatedUser,
        input: ChannelCreateInput
    ) => Promise<Channel>
    addUserToServer: (
        user: AuthenticatedUser,
        input: ServerJoinInput
    ) => Promise<ServerDetail>
    leaveServer: (
        user: AuthenticatedUser,
        input: ServerLeaveInput
    ) => Promise<boolean>
    deleteServer: (
        user: AuthenticatedUser,
        input: ServerDeleteInput
    ) => Promise<boolean>
    deleteChannel: (
        user: AuthenticatedUser,
        serverId: string,
        channelId: string
    ) => Promise<boolean>
    getServerDetails: (serverId: string) => Promise<ServerDetail>
    getPagedChannels: (
        user: AuthenticatedUser,
        serverId: string,
        limit: number,
        offset: number
    ) => Promise<Channel[]>
}

export default IServerService
