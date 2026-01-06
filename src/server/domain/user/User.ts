export class User {
    internalId: number
    id: string
    username: string
    email: string
    password: string
    createdAt: Date

    constructor(
        internalId: number,
        id: string,
        username: string,
        email: string,
        password: string,
        createdAt: Date
    ) {
        this.internalId = internalId
        this.id = id
        this.username = username
        this.email = email
        this.password = password
        this.createdAt = createdAt
    }
}
