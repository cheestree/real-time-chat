import { RequestHandler } from 'express'
import UserServices from '../../services/UserServices'

const authenticatorWithServices = (
    userService: UserServices
): RequestHandler => {
    return async (req, res, next) => {
        if (!req.cookies.token) {
            return res.status(401).send('No token!')
        }

        const token: string = req.cookies.token

        try {
            const authenticatedUser = await userService.checkAuth(token)
            if (authenticatedUser) {
                ;(req as any).authenticatedUser = authenticatedUser
                return next()
            }
            return res.status(401).send('Token invalid')
        } catch (err) {
            console.log(err)
            return res.status(401).send('Authentication error')
        }
    }
}

export default authenticatorWithServices
