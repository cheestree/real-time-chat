import { Generated, Insertable, Selectable } from 'kysely'

export interface UsersTable {
    internalId: Generated<number>
    id: Generated<string>
    username: string
    email: string
    password: string
    created_at: Generated<Date>
}

export interface Database {
    'rtchat.users': UsersTable
}

export type UserInsertable = Insertable<Database['rtchat.users']>
export type UserSelectable = Selectable<UsersTable>
