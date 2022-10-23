/* eslint-disable no-unused-vars */
import ChatbotUserMessage from '~/models/chatbot/messages/user-message'
import ChatbotReplyMessage from '~/models/chatbot/messages/reply-message'

export enum ChatbotGroup {
  CHATBOT_REPLIES = 'CHATBOT_REPLIES',
  USER_MESSAGES = 'USER_MESSAGES',
}

export type ReplyGroup = {
  kind: ChatbotGroup.CHATBOT_REPLIES
  messages: ChatbotReplyMessage[]
}

export type UserGroup = {
  kind: ChatbotGroup.USER_MESSAGES
  messages: ChatbotUserMessage[]
}
