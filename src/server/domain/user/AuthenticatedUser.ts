export type AuthenticatedUser = {
    internalId: number
    publicId: string
    profile: {
        id: string
        username: string
    }
}
