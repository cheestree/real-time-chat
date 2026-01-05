import { Router } from 'express'
import HybridServerController from '../controller/HybridServerController'
import ServerController from '../controller/ServerController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { validateZod } from '../http/middleware/ValidateZod'
import { ChannelCreateSchema } from '../http/model/input/channel/ChannelCreateInput'
import { ServerCreateSchema } from '../http/model/input/server/ServerCreateInput'
import { ServerDeleteSchema } from '../http/model/input/server/ServerDeleteInput'
import { ServerJoinSchema } from '../http/model/input/server/ServerJoinInput'
import { Path } from '../http/path/Path'
import { createServerRepository } from '../repository/server/createServerRepository'
import { createUserRepository } from '../repository/user/createUserRepository'
import ServerServices from '../services/ServerServices'
import UserServices from '../services/UserServices'

class ServerRoutes {
    public router = Router()
    public userServices: UserServices
    public serverServices: ServerServices
    private serverController: ServerController
    private hybridController: HybridServerController

    constructor() {
        const serverRepository = createServerRepository()
        const userRepository = createUserRepository()
        this.userServices = new UserServices(userRepository)
        this.serverServices = new ServerServices(
            serverRepository,
            userRepository
        )
        this.serverController = new ServerController(this.serverServices)
        this.hybridController = new HybridServerController(
            this.serverServices,
            this.userServices
        )
        this.initRoutes()
    }

    private initRoutes() {
        const auth = authenticatorWithServices(this.userServices)

        // Servers
        this.router.get(Path.SERVERS, auth, this.serverController.listServers)
        this.router.post(
            Path.SERVERS,
            auth,
            validateZod(ServerCreateSchema),
            this.serverController.createServer
        )
        this.router.post(
            `${Path.SERVERS}/join`,
            auth,
            validateZod(ServerJoinSchema),
            this.hybridController.joinServer
        )
        this.router.post(
            `${Path.SERVERS}/delete`,
            auth,
            validateZod(ServerDeleteSchema),
            this.hybridController.deleteServer
        )
        this.router.get(
            `${Path.SERVERS}/:serverId`,
            auth,
            this.serverController.getServerDetails
        )

        // Channels
        this.router.post(
            Path.CHANNELS,
            auth,
            validateZod(ChannelCreateSchema),
            this.hybridController.createChannel
        )
        this.router.delete(
            `${Path.CHANNELS}/:serverId/:channelId`,
            auth,
            this.hybridController.deleteChannel
        )
        this.router.get(
            `${Path.CHANNELS}/:serverId`,
            auth,
            this.serverController.getPagedChannels
        )
        this.router.get(
            `${Path.SERVERS}/:serverId/users`,
            auth,
            this.serverController.getServerUsers
        )
    }
}

const serverRoutes = new ServerRoutes()
export { serverRoutes }
