import { RequestHandler } from 'express'
import ServerServices from '../services/ServerServices'

class ServerController {
    private services: ServerServices
    constructor(services: ServerServices) {
        this.services = services
    }
    listServers: RequestHandler = (req, res) =>
        res.status(501).send('Not implemented')
    getServer: RequestHandler = (req, res) =>
        res.status(501).send('Not implemented')
    createServer: RequestHandler = (req, res) =>
        res.status(501).send('Not implemented')
    deleteServer: RequestHandler = (req, res) =>
        res.status(501).send('Not implemented')
}

export default ServerController
