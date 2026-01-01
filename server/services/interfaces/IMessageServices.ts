import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'
import { MessageSummary } from '../../http/model/output/server/MessageSummary'

export interface IMessageServices {
    sendMessage(
        user: AuthenticatedUser,
        input: MessageCreateInput
    ): Promise<MessageSummary>
}
