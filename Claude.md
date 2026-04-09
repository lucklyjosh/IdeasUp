# CLAUDE.md — Loft

This file is the source of truth for architecture, conventions, and code style.
Read this before writing any code.

---

## 1. What we're building

**Loft** is a community platform where:
- **Builders** post vibe coding projects and startup ideas to get votes and feedback
- **Requesters** post small real-world needs from their industry, looking for someone to build a solution
- Anyone can browse, vote, comment, and connect

Two content types: **Ideas** (builder-initiated) and **Needs** (requester-initiated).

---

## 2. Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, RSC, easy deployment |
| Language | TypeScript (strict) | Required everywhere, no `any` |
| Styling | Tailwind CSS v3 | Utility-first, consistent spacing |
| Database | Supabase (Postgres) | Auth + DB + Realtime in one |
| ORM | Prisma | Type-safe queries, easy migrations |
| Auth | Supabase Auth | Email + OAuth (GitHub, Google) |
| File uploads | Supabase Storage | Images and videos for posts |
| State | Zustand | Lightweight client state only |
| Forms | React Hook Form + Zod | Validation with type inference |
| Email | Resend | Transactional emails |
| Deployment | Vercel | Zero-config Next.js hosting |

---

## 3. Directory structure

```
loft/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route group: public pages
│   │   └── page.tsx              # Homepage / feed
│   ├── ideas/
│   │   ├── page.tsx              # Ideas feed
│   │   └── [id]/
│   │       └── page.tsx          # Idea detail
│   ├── needs/
│   │   ├── page.tsx              # Needs feed
│   │   └── [id]/
│   │       └── page.tsx          # Need detail
│   ├── post/
│   │   └── page.tsx              # Post idea or need (unified form)
│   ├── profile/
│   │   └── [username]/
│   │       └── page.tsx          # Public profile
│   ├── api/
│   │   ├── votes/route.ts
│   │   ├── comments/route.ts
│   │   ├── posts/route.ts
│   │   └── upload/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                       # Primitive components (no business logic)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Card.tsx
│   │   └── VoteControl.tsx
│   ├── feed/                     # Feed-specific components
│   │   ├── FeedCard.tsx          # Single row card (idea or need)
│   │   ├── FeedList.tsx          # Scrollable list of FeedCards
│   │   ├── FeedSegment.tsx       # All / Ideas / Needs switcher
│   │   └── FeedFilters.tsx       # Category tabs + sort
│   ├── post/                     # Post creation form
│   │   ├── PostForm.tsx          # Unified form shell
│   │   ├── MediaUpload.tsx       # Image/video upload with preview
│   │   ├── TypeSelector.tsx      # Idea vs Need toggle
│   │   └── StageSelector.tsx
│   ├── detail/                   # Detail page components
│   │   ├── PostHeader.tsx
│   │   ├── RatingPanel.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentInput.tsx
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── HeroSection.tsx
│   └── providers/
│       ├── AuthProvider.tsx
│       └── QueryProvider.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookies)
│   │   └── admin.ts              # Service role client
│   ├── prisma.ts                 # Prisma singleton
│   ├── validations/
│   │   ├── post.ts               # Zod schemas for posts
│   │   ├── comment.ts
│   │   └── vote.ts
│   └── utils/
│       ├── cn.ts                 # clsx + tailwind-merge helper
│       ├── format.ts             # Date, number formatting
│       └── upload.ts             # Upload helpers
│
├── hooks/
│   ├── useVote.ts                # Optimistic vote mutation
│   ├── useComments.ts
│   ├── useFeed.ts                # Feed data with infinite scroll
│   └── useAuth.ts
│
├── store/
│   └── ui.ts                     # Zustand: modal state, filters
│
├── types/
│   ├── post.ts
│   ├── user.ts
│   ├── comment.ts
│   └── vote.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── .env.local                    # Never commit
├── .env.example                  # Commit this
├── CLAUDE.md                     # This file
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. Database schema

```prisma
// prisma/schema.prisma

model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String    @unique
  avatarUrl   String?
  bio         String?
  createdAt   DateTime  @default(now())

  posts       Post[]
  votes       Vote[]
  comments    Comment[]
}

model Post {
  id          String     @id @default(cuid())
  type        PostType   // IDEA | NEED
  title       String
  description String
  stage       Stage?     // Just an idea | Prototype | Live — only for IDEA
  industry    String?    // only for NEED
  techStack   String[]
  links       String[]
  mediaUrls   String[]
  openToCollab Boolean   @default(false)
  willingToPay Boolean   @default(false)  // only for NEED
  status      NeedStatus @default(OPEN)   // only for NEED
  score       Int        @default(0)      // denormalized vote count

  authorId    String
  author      User       @relation(fields: [authorId], references: [id])
  votes       Vote[]
  comments    Comment[]
  categories  Category[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Vote {
  id        String   @id @default(cuid())
  value     Int      // 1 or -1
  userId    String
  postId    String
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}

model Comment {
  id        String    @id @default(cuid())
  body      String
  userId    String
  postId    String
  parentId  String?   // for nested replies
  user      User      @relation(fields: [userId], references: [id])
  post      Post      @relation(fields: [postId], references: [id])
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  createdAt DateTime  @default(now())
}

enum PostType {
  IDEA
  NEED
}

enum Stage {
  IDEA
  PROTOTYPE
  LIVE
}

enum NeedStatus {
  OPEN
  IN_PROGRESS
  DONE
}
```

---

## 5. Naming conventions

### Files & folders
- **Components**: PascalCase — `FeedCard.tsx`, `MediaUpload.tsx`
- **Hooks**: camelCase with `use` prefix — `useVote.ts`, `useFeed.ts`
- **Utilities**: camelCase — `format.ts`, `cn.ts`
- **API routes**: `route.ts` inside a named folder — `app/api/votes/route.ts`
- **Types**: camelCase files, PascalCase types — `post.ts` exports `Post`, `PostType`

### Variables & functions
- Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_IMAGE_SIZE`, `DEFAULT_PAGE_SIZE`
- React components: `PascalCase`
- Event handlers: `handle` prefix — `handleVote`, `handleSubmit`
- Async functions: verb-noun — `fetchFeed`, `createPost`, `deleteComment`
- Boolean vars: `is`/`has`/`can` prefix — `isLoading`, `hasVoted`, `canEdit`

### Tailwind
- No inline styles. Everything through Tailwind classes.
- Shared class combos live in a component, not a string variable.
- Use the `cn()` helper for conditional classes:
  ```ts
  import { cn } from "@/lib/utils/cn"
  cn("base-class", isActive && "active-class", className)
  ```

---

## 6. Code conventions

### TypeScript
```ts
// Always type props explicitly — no implicit any
type FeedCardProps = {
  post: Post
  currentUserId?: string
  onVote?: (postId: string, value: 1 | -1) => void
}

// Use type for objects, interface for extensible shapes
type ApiResponse<T> = {
  data: T | null
  error: string | null
}

// Prefer const assertions for enums
const POST_TYPES = ["IDEA", "NEED"] as const
type PostType = typeof POST_TYPES[number]
```

### Components
```tsx
// Co-locate types with the component
// Default export for pages, named export for components
// Props destructured in signature

export function FeedCard({ post, currentUserId, onVote }: FeedCardProps) {
  // 1. hooks
  // 2. derived state
  // 3. handlers
  // 4. render
}
```

### Server vs Client components
- Default to **Server Components** — no `"use client"` unless needed
- Add `"use client"` only for: event handlers, useState, useEffect, browser APIs
- Keep client components small — push data fetching up to server

### Data fetching
```ts
// Server component — fetch directly
async function IdeasPage() {
  const posts = await prisma.post.findMany({ ... })
  return <FeedList posts={posts} />
}

// Client mutation — use a custom hook with optimistic update
function useVote(postId: string) {
  const [optimisticScore, setOptimisticScore] = useState(initialScore)
  // ...
}
```

### API routes
```ts
// app/api/votes/route.ts
export async function POST(req: Request) {
  // 1. Auth check
  // 2. Parse + validate body with Zod
  // 3. Business logic
  // 4. Return typed response
}
```

### Zod schemas
```ts
// lib/validations/post.ts
export const createPostSchema = z.object({
  type: z.enum(["IDEA", "NEED"]),
  title: z.string().min(5).max(80),
  description: z.string().min(20).max(2000),
  techStack: z.array(z.string()).max(10).optional(),
  links: z.array(z.string().url()).max(5).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
```

---

## 7. Environment variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# Upload limits
NEXT_PUBLIC_MAX_IMAGE_SIZE_MB=10
NEXT_PUBLIC_MAX_VIDEO_SIZE_MB=100
NEXT_PUBLIC_MAX_IMAGES_PER_POST=6
```

---

## 8. Key constants

```ts
// lib/utils/constants.ts

export const FEED_PAGE_SIZE = 20
export const MAX_IMAGES_PER_POST = 6
export const MAX_IMAGE_SIZE_MB = 10
export const MAX_VIDEO_SIZE_MB = 100
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]

export const INDUSTRIES = [
  "Healthcare",
  "Finance",
  "Legal",
  "Operations",
  "Education",
  "Real estate",
  "Retail",
  "Logistics",
  "HR",
  "Other",
] as const

export const IDEA_CATEGORIES = [
  "Vibe coding",
  "Startup",
  "AI / ML",
  "Side project",
  "Open source",
] as const
```

---

## 9. Git conventions

### Branch naming
```
feature/feed-infinite-scroll
fix/vote-optimistic-update
chore/update-prisma-schema
```

### Commit messages (Conventional Commits)
```
feat: add media upload to post form
fix: correct vote score on optimistic rollback
chore: add zod validation to comment API
refactor: extract VoteControl into shared component
```

### PR rules
- One concern per PR
- Must pass `tsc --noEmit` and `eslint` before merge
- No `console.log` in production code — use a logger utility

---

## 10. Development workflow

### Modular task breakdown

Every feature must be broken into small, independently completable tasks before writing any code. A task should take no more than a few hours. If it feels bigger, split it again.

**Example — "voting feature" broken down:**
```
[ ] Create Vote model migration
[ ] Write Zod schema for vote input
[ ] Build POST /api/votes route with auth check
[ ] Build DELETE /api/votes route
[ ] Write useVote hook with optimistic update
[ ] Build VoteControl UI component
[ ] Wire VoteControl into FeedCard
[ ] Wire VoteControl into detail page header
```

Each task = one commit. Never bundle unrelated changes.

---

### Testing requirements

Every non-trivial piece of logic needs a test. No exceptions.

**What to test:**

| Type | Tool | What it covers |
|---|---|---|
| Unit | Vitest | Utility functions, Zod schemas, pure logic |
| Component | Vitest + React Testing Library | UI components in isolation |
| Integration | Vitest | API route handlers, hook behavior |
| E2E | Playwright | Critical user flows end-to-end |

**Test file location:** co-locate with the source file
```
hooks/useVote.ts
hooks/useVote.test.ts

lib/validations/post.ts
lib/validations/post.test.ts

components/ui/VoteControl.tsx
components/ui/VoteControl.test.tsx
```

**Minimum coverage per task:**
- All Zod schemas — test valid input, invalid input, edge cases
- All API routes — test success path, auth failure, validation failure
- All hooks with side effects — test optimistic update + rollback on error
- All utility functions — test every branch

**Test naming:**
```ts
describe("useVote", () => {
  it("increments score optimistically on upvote")
  it("rolls back score if API call fails")
  it("prevents voting when user is not authenticated")
})
```

Run before every commit:
```bash
pnpm test           # run all tests
pnpm test:watch     # watch mode during development
pnpm test:e2e       # Playwright end-to-end
```

---

### Code review checklist

Self-review every task before committing. Go through this list — if any item fails, fix it first.

**Correctness**
- [ ] Does it do exactly what the task describes — nothing more, nothing less?
- [ ] Are edge cases handled: empty state, loading, error?
- [ ] No unintended side effects on other features?

**Types & validation**
- [ ] No `any` — use `unknown` and narrow
- [ ] All external inputs validated with Zod before use
- [ ] API responses typed with `ApiResponse<T>`

**Components**
- [ ] Server component by default — `"use client"` only where required
- [ ] No business logic inside the component — extracted to a hook or lib
- [ ] Props are explicitly typed

**Data & state**
- [ ] No direct Supabase calls from client components
- [ ] Mutations use optimistic updates where the user expects instant feedback
- [ ] No `useEffect` for data fetching

**Hygiene**
- [ ] No `console.log` left in
- [ ] No hardcoded strings for enums — import from constants
- [ ] No duplicated logic — if it appears twice, extract it
- [ ] All tests pass: `pnpm test && pnpm typecheck && pnpm lint`

---

## 11. What NOT to do

- No `any` in TypeScript — use `unknown` and narrow
- No direct Supabase calls from client components — go through API routes or server components
- No business logic in components — extract to hooks or lib functions
- No hardcoded strings for categories/enums — import from constants
- No `!important` in CSS
- No `useEffect` for data fetching — use RSC or React Query
- No storing sensitive keys in `NEXT_PUBLIC_` vars