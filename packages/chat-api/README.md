# Chat API Package

Reusable chatbot communication service for the LMS, dashboard, and other frontend applications.

## Usage

Pass the application's authenticated API client to `createChatApi`:

```js
import { createChatApi } from '@amaanitvam/chat-api';
import api from './api';

const chatApi = createChatApi(api);

const conversations = await chatApi.fetchConversations();
const history = await chatApi.fetchChatHistory(conversationId);
const reply = await chatApi.sendChatMessage(conversationId, {
  content: 'Explain this topic.',
});
```

## Available methods

- `createConversation(options)` creates a conversation.
- `fetchConversations(options)` returns `{ items, meta }`.
- `fetchChatHistory(conversationId, options)` returns `{ items, meta }`.
- `sendChatMessage(conversationId, options)` returns the assistant message.

The API client must attach the Firebase bearer token. LMS and dashboard already do this through their local Axios clients. The package does not know about Firebase and does not create its own HTTP client.

All methods throw an `Error` with `message`, `code`, `status`, and `details` when the backend returns the standard error envelope.
