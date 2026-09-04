const unwrapData = (payload) => payload.data;

const unwrapPaginated = (payload) => ({
  items: payload.data,
  meta: payload.meta,
});

const throwApiError = (error) => {
  const responseData = error?.response?.data;
  const apiError = responseData?.error;

  if (responseData?.success === false && apiError) {
    const chatError = new Error(apiError.message);
    chatError.code = apiError.code;
    chatError.status = error.response.status;
    chatError.details = apiError.details || [];
    throw chatError;
  }

  if (error?.response) {
    throw new Error(`Chat service request failed with HTTP ${error.response.status}.`);
  }

  throw new Error(error?.message || 'Could not connect to the chat service.');
};

const request = async (operation) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    throwApiError(error);
  }
};

export function createChatApi(apiClient) {
  if (!apiClient?.get || !apiClient?.post) {
    throw new TypeError('createChatApi requires an authenticated API client.');
  }

  return {
    async sendChatMessage(conversationId, {
      content,
      contextType = 'general',
      contextId = null,
      contextLabel = null,
    } = {}) {
      if (!String(content || '').trim()) {
        const error = new Error('Message content is required.');
        error.code = 'VALIDATION_ERROR';
        error.status = 400;
        throw error;
      }

      return request(() => apiClient.post(
        `/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          content: content.trim(),
          context_type: contextType,
          context_id: contextId,
          context_label: contextLabel,
        },
      )).then(unwrapData);
    },

    async fetchChatHistory(conversationId, { page = 1, limit = 50 } = {}) {
      return request(() => apiClient.get(
        `/conversations/${encodeURIComponent(conversationId)}/messages`,
        { params: { page, limit } },
      )).then(unwrapPaginated);
    },

    async fetchConversations({
      page = 1,
      limit = 20,
      includeArchived = false,
    } = {}) {
      return request(() => apiClient.get('/conversations', {
        params: {
          page,
          limit,
          include_archived: includeArchived,
        },
      })).then(unwrapPaginated);
    },

    async createConversation({
      contextType = 'general',
      contextId = null,
    } = {}) {
      return request(() => apiClient.post('/conversations', {
        context_type: contextType,
        context_id: contextId,
      })).then(unwrapData);
    },
  };
}
