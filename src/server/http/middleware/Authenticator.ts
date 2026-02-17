import { Request, RequestHandler } from 'express'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import UserServices from '../../services/UserService'

export interface AuthenticatedRequest extends Request {
    authenticatedUser: AuthenticatedUser
}

const authenticatorWithServices = (
    userService: UserServices
): RequestHandler => {
    return async (req: Request, res, next) => {
        if (!req.cookies.token) {
            return res.status(401).send('No token!')
        }

        const token: string = req.cookies.token

        try {
            const authenticatedUser = await userService.checkAuth(token)
            if (authenticatedUser) {
                ;(req as AuthenticatedRequest).authenticatedUser =
                    authenticatedUser
                return next()
            }
            return res.status(401).send('Token invalid')
        } catch (err) {
            return res.status(401).send('Authentication error')
        }
    }
}

export default authenticatorWithServices
