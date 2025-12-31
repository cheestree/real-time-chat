import { Server } from '../../domain/server/Server'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { ChannelCreateInput } from '../../http/model/input/channel/ChannelCreateInput'
import { ServerCreateInput } from '../../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../../http/model/input/server/ServerDeleteInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'
import { ChannelSummary } from '../../http/model/output/server/ChannelSummary'
import { ServerDetail } from '../../http/model/output/server/ServerDetail'
import { ServerSummary } from '../../http/model/output/server/ServerSummary'

interface IServerServices {
    getUserServers: (userId: string) => Promise<ServerSummary[]>
    getServerById: (serverId: number) => Promise<Server>
    serverExists: (serverId: number) => Promise<boolean>
    createServer: (
        user: AuthenticatedUser,
        input: ServerCreateInput
    ) => Promise<Server>
    createChannel: (
        user: AuthenticatedUser,
        input: ChannelCreateInput
    ) => Promise<ChannelSummary>
    addUserToServer: (
        user: AuthenticatedUser,
        serverId: number
    ) => Promise<Server>
    leaveServer: (
        user: AuthenticatedUser,
        input: ServerLeaveInput
    ) => Promise<boolean>
    deleteServer: (
        user: AuthenticatedUser,
        input: ServerDeleteInput
    ) => Promise<boolean>
    getServerDetails: (serverId: number) => Promise<ServerDetail>
}

export default IServerServices
