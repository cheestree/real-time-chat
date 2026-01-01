import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import ServerServices from '../services/ServerServices'

class ServerController {
    private services: ServerServices
    constructor(services: ServerServices) {
        this.services = services
    }
    listServers: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })
    getServerDetails: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })
    createServer: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })
    joinServer: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })
    deleteServer: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })
}

export default ServerController
