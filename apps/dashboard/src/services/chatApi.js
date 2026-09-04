import { createChatApi } from '@amaanitvam/chat-api';
import api from './api';

const chatApi = createChatApi(api);

export const {
  sendChatMessage,
  fetchChatHistory,
  fetchConversations,
  createConversation,
} = chatApi;

export default chatApi;