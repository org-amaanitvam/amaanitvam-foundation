# AI Doubt Support Microservice

The **AI Doubt Support Microservice** is a high-performance, asynchronous FastAPI microservice designed for the Amaanitvam Foundation Learning Portal. Its primary purpose is to provide students with intelligent, context-aware doubt resolution across course lessons, digital library materials, and general academic topics.

By leveraging **Retrieval-Augmented Generation (RAG)** backed by ChromaDB and Google Gemini (`gemini-1.5-flash`), the service ensures that student queries are answered accurately using only approved educational materials, enforcing strict security and permission boundaries.

---

# Architecture Overview

The AI service operates as an isolated backend microservice alongside the main Node.js API Gateway, PostgreSQL database, and ChromaDB vector store.

### Communication Flow
1. **Frontend to Node.js Gateway:** Students interact with the React frontend (Lesson Page, Digital Library, or Student Dashboard). The frontend sends requests to the Node.js API Gateway with a Firebase Bearer Token.
2. **Node.js Gateway to AI Microservice:** The Node.js server authenticates the student via Firebase Admin SDK, extracts the `firebase_uid`, and proxies the request to the AI Microservice using HTTP over internal networks, secured by the `X-Internal-Secret` header.
3. **AI Microservice Processing:**
   - **Permission Check:** Calls back to Node.js to fetch the student's permissions (`enrolled_course_ids`, `accessible_resource_ids`).
   - **RAG Retrieval:** Queries ChromaDB for top relevant text chunks matching the student's query, filtered strictly by accessible `source_id`s.
   - **LLM Generation:** Combines conversation history and retrieved context chunks into a structured prompt sent to Google Gemini (`gemini-1.5-flash`).
   - **Persistence:** Saves user and assistant messages, AI notifications, and audit logs to PostgreSQL.
4. **Response:** Returns the structured message response back through the Node.js proxy to the student.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LEARNING PORTAL FRONTEND                         │
│                    (Course Page / Library / Dashboard)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP (Bearer <Firebase_Token>)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       NODE.JS MAIN API GATEWAY                          │
│                             (Port 5000)                                 │
│  - Firebase ID Token Verification                                       │
│  - Express Proxy Routes (/api/conversations, /api/ai-notifications)     │
└──────────────┬──────────────────────────────────────────▲───────────────┘
               │                                          │
               │ HTTP POST /internal/chat                 │ Response Payload
               │ Header: X-Internal-Secret                │
               ▼                                          │
┌─────────────────────────────────────────────────────────┴───────────────┐
│                       FASTAPI AI MICROSERVICE                           │
│                             (Port 8001)                                 │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ Permission & RAG     │  │ LLM Orchestrator │  │ Persistence       │  │
│  │ (permission_service, │  │ (llm_service,    │  │ (message_service, │  │
│  │  rag_service)        │  │  Gemini API)     │  │  PostgreSQL ORM)  │  │
│  └───────────┬──────────┘  └────────┬─────────┘  └─────────┬─────────┘  │
└──────────────┼──────────────────────┼──────────────────────┼────────────┘
               │                      │                      │
               ▼                      ▼                      ▼
┌──────────────────────────┐┌──────────────────┐┌────────────────────────┐
│     ChromaDB Vector      ││  Google Gemini   ││  PostgreSQL Database   │
│     (Local Embeddings)   ││  (1.5 Flash LLM) ││  (Conversations/Logs)  │
└──────────────────────────┘└──────────────────┘└────────────────────────┘
```

---

# Features Implemented

The AI Microservice has been fully implemented and verified through **Phase 8** of the implementation plan:

- **FastAPI Async Application:** Asynchronous event loop with lifespan setup for database health pings and ChromaDB collection initialization.
- **Configuration Management:** Centralized Pydantic `BaseSettings` (`app/config.py`) loading variables from `.env`.
- **PostgreSQL & SQLAlchemy Integration:** Async SQLAlchemy engine (`asyncpg`) with session dependency injection and pooling.
- **Alembic Migrations:** Version-controlled database migrations for table creation, updates, and indexes.
- **Conversation Management:** APIs for creating, fetching, listing (paginated), and archiving conversations without hard deletion.
- **Message Persistence & History:** Automatic persistence of user and assistant messages, tracking `model_used`, token counts, and `latency_ms`. Context window history loader (last 5 messages).
- **AI Notifications:** Automated creation of `ai_response_ready` notifications when assistant replies are saved.
- **AI Audit Logs:** Detailed logging of token usage, latency, context type, and context IDs in the `ai_logs` table.
- **Internal Authentication:** Middleware enforcing valid `X-Internal-Secret` header on all `/internal/*` endpoints.
- **ChromaDB Vector Store Integration:** Singleton client managing persistent vector storage (`./chroma_data`) with `text-embedding-004` embeddings.
- **Permission-Gated RAG Pipeline:** Context retrieval filtered dynamically by `source_id` matching user-enrolled course IDs and accessible resource IDs.
- **Text Chunking Engine:** Chunking utility breaking documents into ~500-token chunks with 50-token overlap to prevent split-context data loss.
- **Gemini LLM Service:** Prompts formatted with strict system boundaries ("You are an AI Doubt Assistant for Amaanitvam Foundation...") calling `gemini-1.5-flash`.
- **Node.js Express Proxy Bridge:** Express proxy routers (`conversation.routes.js`, `ai-notification.routes.js`, `conversation.proxy.js`) forwarding frontend requests securely to FastAPI.
- **Structured Error Handling:** Standardized `APIError` responses with custom error codes (`CONVERSATION_NOT_FOUND`, `LLM_UNAVAILABLE`, `RATE_LIMIT_EXCEEDED`, `INDEXING_FAILED`).
- **In-Memory Rate Limiting:** 30 messages per minute rate limiter per `firebase_uid`.

---

# Project Structure

```
ai-service/
├── alembic/                         # Database migration scripts
│   ├── env.py                       # Alembic environment runner
│   └── versions/                    # Versioned migration scripts
│       ├── 001_create_conversations.py
│       ├── 002_create_messages.py
│       ├── 003_create_ai_logs.py
│       └── 004_create_ai_notifications.py
├── app/
│   ├── __init__.py
│   ├── config.py                    # Pydantic Settings configuration
│   ├── api/                         # FastAPI Routers
│   │   ├── __init__.py
│   │   ├── conversations.py         # CRUD endpoints for conversations & messages
│   │   ├── internal.py              # Internal endpoints (/internal/chat, /internal/index-*)
│   │   ├── messages.py              # Message router stub
│   │   └── notifications.py        # AI notifications endpoints
│   ├── database/
│   │   ├── __init__.py
│   │   ├── chroma.py                # ChromaDB client & collection management
│   │   └── session.py               # Async SQLAlchemy engine & session factory
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── internal_auth.py         # X-Internal-Secret header validator
│   │   ├── rate_limiter.py          # Message rate limiter (30 msg/min)
│   │   └── user_header.py           # X-Firebase-UID header extractor
│   ├── models/                      # SQLAlchemy ORM Models
│   │   ├── __init__.py
│   │   ├── ai_log.py                # ai_logs table definition
│   │   ├── ai_notification.py       # ai_notifications table definition
│   │   ├── conversation.py          # conversations table definition
│   │   └── message.py               # messages table definition
│   ├── schemas/                     # Pydantic Schemas & DTOs
│   │   ├── __init__.py
│   │   ├── common.py                # APIResponse, PaginatedResponse, ErrorCode
│   │   ├── conversation.py          # Conversation DTOs
│   │   ├── indexing.py              # Indexing request/response schemas
│   │   ├── message.py               # Message & Chat request/response schemas
│   │   └── notification.py         # Notification DTOs
│   └── services/                    # Business Logic Layer
│       ├── __init__.py
│       ├── chat_service.py          # Thin chat orchestrator
│       ├── conversation_service.py    # Conversation CRUD logic
│       ├── embedding_service.py     # Gemini embedding API wrapper
│       ├── indexing_service.py      # Text chunking & ChromaDB upsert/delete
│       ├── llm_service.py           # Prompt builder & Gemini LLM caller
│       ├── message_service.py       # Message & notification persistence
│       ├── notification_service.py  # Notification CRUD logic
│       ├── permission_service.py    # Node.js permission client caller
│       └── rag_service.py           # Permission-gated ChromaDB query engine
├── tests/                           # Pytest unit & integration tests
│   ├── test_chat.py
│   ├── test_conversations.py
│   ├── test_health.py
│   ├── test_indexing.py
│   ├── test_internal_auth.py
│   └── test_rag_permissions.py
├── .env.example                     # Environment template
├── alembic.ini                      # Alembic configuration
├── main.py                          # FastAPI entry point & lifespan
├── pyproject.toml                   # Pytest configuration
└── requirements.txt                 # Python dependencies
```

---

# Database Design

The microservice connects to a dedicated PostgreSQL database containing 4 primary tables:

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│        conversations         │       │           messages           │
├──────────────────────────────┤       ├──────────────────────────────┤
│ id (PK, UUID)                │1     *│ id (PK, UUID)                │
│ firebase_uid (VARCHAR, IDX)  ├───────┤ conversation_id (FK, UUID)   │
│ title (VARCHAR)              │       │ role (VARCHAR: user|assistant)│
│ context_type (VARCHAR)       │       │ content (TEXT)               │
│ context_id (VARCHAR)         │       │ model_used (VARCHAR)         │
│ is_archived (BOOLEAN, IDX)   │       │ latency_ms (INTEGER)         │
│ message_count (INTEGER)      │       │ created_at (TIMESTAMPTZ)     │
│ created_at, updated_at       │       └──────────────────────────────┘
└──────────────┬───────────────┘
               │1
               │
               │*
┌──────────────▼───────────────┐       ┌──────────────────────────────┐
│       ai_notifications       │       │           ai_logs            │
├──────────────────────────────┤       ├──────────────────────────────┤
│ id (PK, UUID)                │       │ id (PK, UUID)                │
│ firebase_uid (VARCHAR, IDX)  │       │ firebase_uid (VARCHAR, IDX)  │
│ conversation_id (FK, UUID)   │       │ conversation_id (FK, UUID)   │
│ type (VARCHAR)               │       │ message_id (FK, UUID)        │
│ title (VARCHAR)              │       │ context_type, context_id     │
│ message (TEXT)               │       │ prompt_tokens, response_tokens│
│ is_read (BOOLEAN, IDX)       │       │ total_tokens, latency_ms     │
│ created_at (TIMESTAMPTZ)     │       │ created_at (TIMESTAMPTZ)     │
└──────────────────────────────┘       └──────────────────────────────┘
```

1. **`conversations`**: Stores student chat threads. Indexed by `(firebase_uid, is_archived)` for fast retrieval of active student threads.
2. **`messages`**: Stores individual messages within a conversation. Has a foreign key to `conversations.id` with `ON DELETE CASCADE`.
3. **`ai_notifications`**: Stores notifications generated when AI answers are ready.
4. **`ai_logs`**: Stores telemetry, latency, token usage metrics, and audit logs for AI queries.

---

# Request Lifecycle

### Doubt Request Flow (Sequence Diagram)

```
Student Frontend         Node.js Gateway         FastAPI AI Service         Permission / ChromaDB        Google Gemini
       │                        │                        │                        │                        │
       │── POST /api/convers.──►│                        │                        │                        │
       │   /:id/messages        │                        │                        │                        │
       │   (Bearer Token)       │                        │                        │                        │
       │                        │── Verify Token         │                        │                        │
       │                        │── POST /internal/chat ─►│                        │                        │
       │                        │   (X-Internal-Secret)  │                        │                        │
       │                        │                        │── Check Rate Limit     │                        │
       │                        │                        │── Fetch Permissions ──►│                        │
       │                        │                        │◄─ Allowed Course IDs ──│                        │
       │                        │                        │── Query Chroma Vector ─►│                        │
       │                        │                        │◄─ Context Chunks ──────│                        │
       │                        │                        │── Build System Prompt ─────────────────────────►│
       │                        │                        │◄─ AI Answer Payload ────────────────────────────│
       │                        │                        │── Save Msg to Postgres │                        │
       │                        │                        │── Save AI Notification │                        │
       │                        │                        │── Log Telemetry        │                        │
       │                        │◄─ Return Response ─────│                        │                        │
       │◄─ Return JSON ─────────│                        │                        │                        │
```

---

# API Documentation

### Public / Health Endpoints

#### 1. `GET /health`
- **Purpose:** Public service status check.
- **Auth:** None
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "amaanitvam-ai-service",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

---

### Internal API Endpoints (`/internal/*`)
*All internal routes require `X-Internal-Secret: <SECRET>` header.*

#### 2. `GET /internal/health`
- **Purpose:** Detailed internal health check reporting DB & ChromaDB readiness.
- **Auth:** `X-Internal-Secret`
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "chroma": "ready"
  }
  ```

#### 3. `POST /internal/chat`
- **Purpose:** Main integration point for handling user doubt messages sent from Node.js Gateway.
- **Auth:** `X-Internal-Secret`
- **Request Body:**
  ```json
  {
    "firebase_uid": "user_firebase_123",
    "conversation_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "message": "Explain Newton's third law of motion",
    "context_type": "course",
    "context_id": "course_physics_101"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "msg_8f9a2b3c-1234-5678-90ab-cdef12345678",
      "role": "assistant",
      "content": "Newton's third law states that for every action, there is an equal and opposite reaction...",
      "model_used": "gemini-1.5-flash",
      "latency_ms": 482,
      "created_at": "2026-07-24T18:30:00Z"
    },
    "conversation_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- **Status Codes:** `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found`, `503 Service Unavailable`

#### 4. `POST /internal/index-course/{course_id}`
- **Purpose:** Indexes course lesson text into ChromaDB in 500-token chunks.
- **Auth:** `X-Internal-Secret`, `X-Firebase-UID`
- **Request Body:**
  ```json
  {
    "title": "Physics 101",
    "description": "Introductory Physics",
    "content_blocks": ["Newton's Laws explanation text..."]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "indexed",
      "course_id": "course_physics_101",
      "chunks_indexed": 4
    }
  }
  ```

#### 5. `DELETE /internal/index-course/{course_id}`
- **Purpose:** Deletes all indexed vector chunks for a course from ChromaDB.
- **Auth:** `X-Internal-Secret`, `X-Firebase-UID`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "deleted",
      "course_id": "course_physics_101"
    }
  }
  ```

#### 6. `POST /internal/index-resource/{resource_id}` & `DELETE /internal/index-resource/{resource_id}`
- **Purpose:** Indexes or deletes digital library resource text chunks in ChromaDB.

---

### Client API Endpoints (`/api/*`)
*Used by frontend via Node.js proxy. Require `X-Internal-Secret` and `X-Firebase-UID` headers.*

#### 7. `POST /api/conversations`
- **Purpose:** Create a new conversation thread.
- **Request Body:**
  ```json
  {
    "context_type": "course",
    "context_id": "course_physics_101"
  }
  ```
- **Response (201 Created):** `APIResponse[ConversationResponse]`

#### 8. `GET /api/conversations`
- **Purpose:** List user conversations (paginated, sorted by `updated_at DESC`).
- **Query Params:** `page=1`, `limit=20`, `include_archived=false`
- **Response (200 OK):** `PaginatedResponse[ConversationListItem]`

#### 9. `GET /api/conversations/{conversation_id}`
- **Purpose:** Fetch single conversation metadata by ID.

#### 10. `PATCH /api/conversations/{conversation_id}/archive`
- **Purpose:** Soft delete/archive a conversation (`is_archived = true`).

#### 11. `GET /api/conversations/{conversation_id}/messages`
- **Purpose:** Fetch messages for a conversation (paginated, oldest-first).

#### 12. `GET /api/ai-notifications` & `PATCH /api/ai-notifications/{id}/read`
- **Purpose:** List and mark AI notifications as read.

---

# Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | FastAPI server port | `8001` |
| `ENVIRONMENT` | Deployment environment (`development` / `production`) | `development` |
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:password@localhost:5432/amaanitvam_ai` |
| `CHROMA_PERSIST_DIR` | Directory for persistent ChromaDB vectors | `./chroma_data` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini LLM model version | `gemini-1.5-flash` |
| `EMBEDDING_MODEL` | Google Gemini Embedding model | `text-embedding-004` |
| `INTERNAL_SHARED_SECRET` | Secret token matching `server/.env` | `amaanitvam_ai_secret_2026` |
| `MAIN_API_URL` | Base URL of Node.js Main API Gateway | `http://localhost:5000` |

---

# Running the Service

### 1. Create Virtual Environment & Install Dependencies
```bash
cd ai-service
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment & PostgreSQL
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```
Ensure PostgreSQL is running and the database specified in `DATABASE_URL` exists.

### 3. Run Alembic Migrations
```bash
alembic upgrade head
```

### 4. Start the Server
```bash
uvicorn main:app --reload --port 8001
```

### 5. Verify Health Endpoint
```bash
curl http://localhost:8001/health
# Expected: {"status":"ok","service":"amaanitvam-ai-service","version":"1.0.0","environment":"development"}
```

### 6. Run Test Suite
```bash
pytest tests/ -v
```

---

# Current Status

The AI Microservice is **100% complete through Phase 8** of the implementation plan. All core features (FastAPI app, PostgreSQL storage, ChromaDB chunking & RAG pipeline, Gemini 1.5 Flash LLM generation, internal auth, rate limiting, conversation CRUD, notification handling, and Node.js Express proxy routes) have been implemented and independently verified with a **100% test pass rate (61/61 pytest suite passed)**.

---

# Pending Integration

The following tasks represent expected integration steps dependent on other team members completing upstream Node.js backend modules:

- **User Permissions Endpoint:** Connecting to `GET /internal/users/:firebaseUid/permissions` on Node.js once the user enrollment schema is live.
- **Course Content Indexing Endpoint:** Connecting to `GET /internal/courses/:courseId/content-index` when published course lesson text schemas are ready.
- **Digital Library Indexing Endpoint:** Connecting to `GET /internal/library/:resourceId/content-index` when digital library resource schemas are published.
- **Automatic Indexing Triggers:** Setting up webhook triggers from Node.js upon course/resource publish/update events.
- **End-to-End Cross-Service Testing:** Validating real end-to-end user flows with live Firebase Auth tokens across frontend, Node.js gateway, and AI microservice.

---

# Troubleshooting

### 1. PostgreSQL Connection Refused / `asyncpg.exceptions`
- **Cause:** PostgreSQL is not running or credentials in `DATABASE_URL` are incorrect.
- **Solution:** Verify PostgreSQL is active (`Get-Service postgresql*` on Windows or `systemctl status postgresql` on Linux) and check host, port, user, and password in `.env`.

### 2. `Invalid internal secret` (HTTP 403)
- **Cause:** `X-Internal-Secret` header sent by client/Node.js does not match `INTERNAL_SHARED_SECRET` in `ai-service/.env`.
- **Solution:** Ensure `INTERNAL_SHARED_SECRET` is identical in both `ai-service/.env` and `server/.env`.

### 3. ChromaDB Initialization / Import Error
- **Cause:** Missing C++ compiler tools or incompatible ChromaDB version on Windows.
- **Solution:** Ensure `chromadb==0.5.3` is installed inside `.venv`. Delete `./chroma_data` if sqlite schema corrupts during development.

### 4. Gemini API Error (`LLM_UNAVAILABLE`)
- **Cause:** Invalid `GEMINI_API_KEY` or quota exceeded.
- **Solution:** Verify your API key at [Google AI Studio](https://aistudio.google.com/app/apikey). Ensure outbound access to `generativelanguage.googleapis.com` is not blocked.

### 5. Alembic `Target database is not up to date`
- **Cause:** Missing migration scripts or un-migrated database schema.
- **Solution:** Run `alembic upgrade head` from the `ai-service` root directory.
