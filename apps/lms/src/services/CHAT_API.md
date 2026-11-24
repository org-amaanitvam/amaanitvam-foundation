# Chat API Service

The chatbot service is available from:

```js
import {
  sendChatMessage,
  fetchChatHistory,
  fetchConversations,
  createConversation,
} from './chatApi';
```

The functions use the LMS adapter around the shared `@amaanitvam/chat-api` package. Firebase authentication is handled automatically by the app's API client, so frontend code does not need to manually add an `Authorization` header. Dashboard usage follows the same pattern through `apps/dashboard/src/services/chatApi.js`.

## 1. `createConversation`

Creates a new conversation for the currently signed-in user.

```js
const conversation = await createConversation({
  contextType: 'course',
  contextId: 'course_physics_101',
});
```

### Arguments

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `contextType` | `'general' \| 'course' \| 'library_resource'` | No | `'general'` | Where the conversation started. |
| `contextId` | `string \| null` | No | `null` | Course or library resource ID. |

### Returns

A conversation object:

```js
{
  id: 'conversation-uuid',
  title: null,
  context_type: 'course',
  context_id: 'course_physics_101',
  is_archived: false,
  message_count: 0,
  created_at: '2026-09-04T10:00:00Z',
  updated_at: '2026-09-04T10:00:00Z'
}
```

## 2. `fetchConversations`

Gets the signed-in user's conversations. The backend controls ownership; do not pass a user ID.

```js
const result = await fetchConversations({
  page: 1,
  limit: 20,
  includeArchived: false,
});

console.log(result.items);
console.log(result.meta.total);
```

### Arguments

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `page` | `number` | No | `1` | Page number, starting at 1. |
| `limit` | `number` | No | `20` | Number of conversations to request. |
| `includeArchived` | `boolean` | No | `false` | Include archived conversations when `true`. |

### Returns

```js
{
  items: [
    {
      id: 'conversation-uuid',
      title: 'Physics question',
      context_type: 'course',
      context_id: 'course_physics_101',
      is_archived: false,
      message_count: 4,
      updated_at: '2026-09-04T10:05:00Z'
    }
  ],
  meta: {
    page: 1,
    limit: 20,
    total: 1
  }
}
```

## 3. `fetchChatHistory`

Gets the messages belonging to one conversation. The backend returns messages in oldest-first order.

```js
const result = await fetchChatHistory('conversation-uuid', {
  page: 1,
  limit: 50,
});

result.items.forEach((message) => {
  console.log(message.role, message.content);
});
```

### Arguments

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `conversationId` | `string` | Yes | UUID of the conversation. |
| `options.page` | `number` | No | Page number; defaults to `1`. |
| `options.limit` | `number` | No | Number of messages; defaults to `50`. |

### Returns

```js
{
  items: [
    {
      id: 'message-uuid',
      conversation_id: 'conversation-uuid',
      role: 'user',
      content: 'Explain Newton\'s first law.',
      token_count: 6,
      model_used: null,
      latency_ms: null,
      is_flagged: false,
      created_at: '2026-09-04T10:01:00Z'
    }
  ],
  meta: {
    page: 1,
    limit: 50,
    total: 1
  }
}
```

## 4. `sendChatMessage`

Sends a message to an existing conversation and returns the assistant's reply. The AI service saves both the user's message and the assistant's reply.

```js
const reply = await sendChatMessage('conversation-uuid', {
  content: 'Explain Newton\'s first law.',
  contextType: 'course',
  contextId: 'course_physics_101',
});

console.log(reply.content);
```

### Arguments

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `conversationId` | `string` | Yes | UUID of the conversation. |
| `options.content` | `string` | Yes | Message text. Blank messages are rejected before the request. |
| `options.contextType` | `string` | No | Defaults to `'general'`. |
| `options.contextId` | `string \| null` | No | Course or resource ID; defaults to `null`. |

### Returns

The service removes the outer success envelope and returns the assistant message:

{
  id: 'message-uuid',
  conversation_id: 'conversation-uuid',
  role: 'assistant',
  content: 'Newton\'s first law states ...',
  token_count: 42,
  model_used: 'gemini-1.5-flash',
  latency_ms: 900,
  is_flagged: false,
  created_at: '2026-09-04T10:02:00Z'
}
}
Use `reply.content` for the assistant text and `reply.conversation_id` to identify the conversation.

Use `reply.data.content` for the assistant text. `reply.conversation_id` is useful when the backend creates a conversation automatically for chat flows that support that behavior.

## Error handling

All four functions throw an error when the request fails. Handle errors with `try/catch`:

```js
try {
  const result = await fetchChatHistory(conversationId);
} catch (error) {
  if (error.code === 'CONVERSATION_NOT_FOUND') {
    showMessage('This conversation is no longer available.');
  } else if (error.status === 401) {
    showMessage('Please sign in again.');
  } else {
    showMessage(error.message);
  }
}
```

The service exposes these error properties:

| Property | Description |
| --- | --- |
| `error.message` | User-readable error message. |
| `error.code` | Backend code such as `CONVERSATION_NOT_FOUND` or `LLM_UNAVAILABLE`. |
| `error.status` | HTTP status code, when the server responded. |
| `error.details` | Additional backend error details, usually an array. |

The backend error response has this shape:

```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "Conversation not found.",
    "details": []
  }
}
```

Do not send `firebase_uid` from the frontend. The backend gets the UID from the verified Firebase token and applies the ownership check.
