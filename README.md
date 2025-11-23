## Realtime Whiteboard (Miro Clone)

A Vercel-ready App Router project that delivers multiplayer whiteboarding (Konva.js + Zustand) with Edge WebSockets, Mongo snapshots, and Redis/KV presence streams. The repo is structured so the entire experience (marketing page, board UI, API routes, and realtime server) deploys in one click to Vercel.

### Tech Stack

| Layer            | Tech                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| Frontend         | Next.js 14 App Router, React 19, Tailwind CSS v4, Konva.js, Zustand             |
| Realtime         | Edge WebSockets (Vercel), custom channel helper (Socket.IO-compatible payloads) |
| Backend          | Next.js route handlers, MongoDB snapshots, Upstash/Redis-friendly pub/sub       |
| Auth (pluggable) | Clerk (via env) or custom JWT middleware                                        |
| Deployment       | Vercel (Edge Functions + Serverless), optional Docker for other hosts           |

### Getting Started Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the marketing page and `http://localhost:3000/boards/demo-board` for the pre-seeded collaborative board. The realtime channel works locally through `ws://localhost:3000/api/realtime`.

### Environment Variables

Copy `.env.example` → `.env.local` and fill in the secrets:

| Variable                                                              | Purpose                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| `MONGODB_URI`, `MONGODB_DB`                                           | Snapshot + metadata storage                            |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` | Presence cache + rate limiting via Vercel KV (Upstash) |
| `REDIS_URL`                                                           | Optional Redis pub/sub fan-out                         |
| `JWT_SECRET`                                                          | Sign board invite tokens / server actions              |
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Enable Clerk auth (optional)                           |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SOCKET_FALLBACK_URL`              | Client-side websocket targeting                        |

All variables are read through `lib/config/env.ts`, so undefined values degrade gracefully for local prototyping.

### Realtime Architecture

1. **Edge WebSocket Gateway** (`app/api/realtime/route.ts`): Rooms are keyed per `boardId`. Messages are fanned out to peers and encoded as Socket.IO-like events (`shape:update`, `presence:update`, etc.).
2. **Client Channel Helper** (`lib/realtime/channel.ts`): Provides automatic reconnect, JSON serialization, and publish/subscribe ergonomics for React components.
3. **State Management** (`lib/store/board-store.ts`): Zustand stores the canonical list of shapes on each client; optimistic updates fire immediately while the realtime channel syncs peers.
4. **Persistence** (`app/api/boards/*` + `lib/services/board-service.ts`): REST endpoints save versioned snapshots to MongoDB. `persistSnapshot` can be wired to cron jobs or triggered by board activity.

### Deploying to Vercel

1. **Create project** – `vercel init` or import the repository. Framework preset: _Next.js_.
2. **Set environment variables** – copy `.env.example` keys into the Vercel dashboard (Production + Preview + Development). Minimum for production: `NEXT_PUBLIC_APP_URL`, `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`.
3. **Provision data stores** – hook up MongoDB Atlas and Upstash Redis/KV; paste credentials into Vercel env settings.
4. **Deploy** – `vercel --prod` or push to `main`. The WebSocket route runs on Vercel Edge automatically (`export const runtime = "edge"`).

### Testing & Quality Checklist

- `npm run lint` – ESLint + React Compiler checks
- `npm run test` – _(add vitest/cypress suites as the project grows)_
- Load-test realtime layer with k6/Artillery hitting `/api/realtime`.

### Future Enhancements

- Wire Clerk for auth + workspace roles
- Persist Y.js documents to reduce merge conflicts
- Add undo/redo timeline stored in Redis streams
- Build Slack/webhook automations for mentions
