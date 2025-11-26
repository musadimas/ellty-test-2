# Posts Tree

Hey! This is a technical test assignment round 2 for **Ellty**. The challenge was to build a threaded discussion app where you can post numbers and do math operations on them in a conversation-style format. tbh its interesting to explore.

## What's This All About?

This is a Next.js app built as a take-home assignment where users can:

- Create root posts with numbers
- Reply to posts with math operations (+, -, \*, /)
- View threaded conversations with full parent chains
- See who replied to whom

The project showcases how to build a production-ready threaded discussion system with proper caching, real-time updates.

## Why Next.js for Everything?

You might be wondering, "Why not separate the backend?" Well, here's the thing:

**Next.js API Routes = Backend Built-in**

- No need to spin up a separate Express/Fastify server
- API routes live right next to your frontend code
- Deployment is dead simple - just push and you're done
- Everything shares the same TypeScript types (no more frontend/backend drift!)
- Prisma works beautifully with Next.js API routes

**The Modern Fullstack Approach**

- Next.js 15+ has insane performance with server components
- You get server-side rendering AND API endpoints in one package
- Vercel/Railway/other platforms deploy this in seconds
- Less infrastructure to manage = more time coding features

Well, why complicate things when Next.js already gives you everything you need? Keep it simple, ship faster.

## The Caching Strategy

This app uses a **dual-cache system** that's alone i honestly think is pretty slick and proud:

### 1. React Query (TanStack Query)

- Handles server state and data fetching
- Infinite scroll for posts
- Automatic background refetching
- Optimistic updates when you create posts

### 2. Zustand Normalized Cache

- Client-side normalized cache for instant reads
- Stores posts by ID for O(1) lookups
- Maintains parent-child relationships
- Syncs automatically with React Query data

**Why Both?**

- React Query handles network state (loading, errors, refetching)
- Zustand gives us instant access to any post without hitting the API
- Together they create a smooth, fast UX with minimal network requests

i think the best part is when you view a post, the app prefetch its children on hover. By the time you click, the data is already there.

## Post Handling & Threading

### Creating Posts

Posts use **FormData** instead of controlled state (better performance, native form features). When you submit:

1. Form data gets sent to `/api/posts` POST endpoint
2. Prisma creates the record in PostgreSQL
3. React Query cache invalidates
4. New data auto-fetches and appears instantly

### Threading System

Each post can have:

- A parent (making it a reply)
- Multiple children (replies to it)
- An operation (+, -, \*, /) if it's a reply
- A calculated result based on parent's result + operation

### Parent Chain Display

When viewing a specific post:

1. API fetches the complete parent chain back to root
2. Posts display in order: Root → ... → Current (highlighted) → Children
3. Each post shows "reply to [username]" so you know the flow
4. Current post gets a blue highlight so you know where you are

### Real-Time Updates

- Polls every 3 minutes for new data
- Smart polling: checks root posts on home, children on post pages
- Shows a "New Posts" button when fresh content arrives
- Timestamp tracking prevents false positives after mutations

## Tech Stack

- **Next.js 15+** - Framework (App Router)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **TanStack Query** - Server state management
- **Zustand** - Client state + normalized cache
- **NextAuth** - Authentication
- **Tailwind CSS** - Styling

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up your `.env`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="your-app-url"
```

3. Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

4. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start posting!

## Project Structure

```
app/
├── api/              # API routes (our "backend")
│   ├── posts/        # Post CRUD endpoints
│   │   └── [id]/     # Single post, children, parents
│   └── auth/         # NextAuth handlers
├── [id]/             # Dynamic post page
└── page.tsx          # Home page (root posts)

components/
├── post-card.tsx     # Post display component
├── post-form.tsx     # Create/reply form
└── post-lists.tsx    # List with infinite scroll

lib/
└── prefetch.ts       # Server-side data fetching utils

store/
└── post-cache.ts     # Zustand normalized cache

prisma/
└── schema.prisma     # Database schema
```

## Cool Features to Check Out

1. **Hover Prefetching** - Hover over a post card, watch the network tab light up
2. **Highlighted Current Post** - Blue background shows which post you're viewing
3. **Reply Chains** - Full conversation context from root to current
4. **Smart Polling** - Different endpoints based on page context
5. **Replies Count** - See engagement at a glance
6. **Optimistic Cache Updates** - Your posts appear before the server confirms

## Utils

Generate SVG React components:

```bash
npx @svgr/cli --out-dir ./public/icons --ignore-existing ./components/icons
```

## Why Build This?

Honestly? Threading is hard. Most tutorials show you basic CRUD, but threaded discussions with proper caching, parent chains, and real-time updates? That's where it gets interesting.

This assignment explores:

- How to structure threaded data in a relational DB
- Cache strategies that actually scale
- Server-side and client-side rendering together
- Building a "backend" without leaving Next.js

Plus it's kinda fun watching numbers calculate as you thread replies deeper and deeper.

tbh its just a counting thread clone with twitter style render lmao
