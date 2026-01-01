import { Server } from '../../domain/server/Server'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { ChannelCreateInput } from '../../http/model/input/channel/ChannelCreateInput'
import { ServerCreateInput } from '../../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../../http/model/input/server/ServerDeleteInput'
import { ServerDetailsInput } from '../../http/model/input/server/ServerDetailsInput'
import { ServerExistsInput } from '../../http/model/input/server/ServerExistsInput'
import { ServerJoinInput } from '../../http/model/input/server/ServerJoinInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'
import { UserServersInput } from '../../http/model/input/server/UserServersInput'
import { ChannelSummary } from '../../http/model/output/server/ChannelSummary'
import { ServerDetail } from '../../http/model/output/server/ServerDetail'
import { ServerSummary } from '../../http/model/output/server/ServerSummary'

interface IServerServices {
    getUserServers: (input: UserServersInput) => Promise<ServerSummary[]>
    getServerById: (input: ServerDetailsInput) => Promise<Server>
    serverExists: (input: ServerExistsInput) => Promise<boolean>
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
        input: ServerJoinInput
    ) => Promise<Server>
    leaveServer: (
        user: AuthenticatedUser,
        input: ServerLeaveInput
    ) => Promise<boolean>
    deleteServer: (
        user: AuthenticatedUser,
        input: ServerDeleteInput
    ) => Promise<boolean>
    getServerDetails: (input: ServerDetailsInput) => Promise<ServerDetail>
}

export default IServerServices
