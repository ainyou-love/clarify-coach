# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clarity Coach AI is a Next.js application that helps professionals improve their communication skills through AI-powered practice sessions. It uses a structured 4-step workflow (Topic → Goal → Main Points → Pitch) and provides instant feedback using either Anthropic Claude or Google Gemini.

## Development Commands

```bash
# Install dependencies
npm install

# Database setup and migrations
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio GUI

# Development
npm run dev              # Start dev server with Turbopack at http://localhost:3000

# Production
npm run build            # Build for production with Turbopack
npm run start            # Start production server

# Code quality
npm run lint             # Run ESLint
```

## Key Architecture Patterns

### AI Integration Layer (`src/lib/ai/`)
The AI system uses a **Strategy Pattern** with automatic failover:
- `AIRouter` orchestrates provider selection based on `AI_PROVIDER` env variable
- Providers (`AnthropicProvider`, `GeminiProvider`) implement the `AIProvider` interface
- Automatic failover to secondary provider on failures
- Structured prompts ensure consistent JSON responses
- Responses are validated against `FeedbackResponse` type

### Authentication Flow (NextAuth v5)
- Configuration in `src/lib/auth/auth-config.ts` exports `NextAuthConfig`
- Helper functions in `src/lib/auth/auth.ts` export `auth()`, `handlers`, `signIn`, `signOut`
- API routes use `auth()` instead of `getServerSession()`
- Middleware (`src/middleware.ts`) protects routes: `/dashboard/*`, `/practice/*`, `/history/*`
- Session type augmentation in `src/types/next-auth.d.ts` adds `id` and `role` to session

### Database Design (Prisma + SQLite/PostgreSQL)
Models use JSON strings for complex data due to SQLite limitations:
- `PracticeSession.mainPoints`: Stores array as JSON string
- `PracticeSession.feedback`: Stores feedback object as JSON string
- `UserProgress`: Automatically created on user registration
- Cascade deletes ensure referential integrity

### Component Organization
- **Shadcn/ui components** (`src/components/ui/`): Base components, don't modify directly
- **Feature components**: Organized by domain (practice/, feedback/, dashboard/, layout/)
- **Form handling**: React Hook Form + Zod for validation
- **State management**: Local state with hooks, Zustand for complex state

## Critical Implementation Details

### Environment Variables
Required variables are validated in `src/lib/env.ts`:
- `AI_PROVIDER`: Must match the API key provided
- `NEXTAUTH_SECRET`: Required for production
- Database automatically uses SQLite in dev, PostgreSQL in production

### API Response Patterns
All API routes follow consistent patterns:
```typescript
// Authentication check
const session = await auth();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Input validation with Zod
const parsed = schema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

// Success response
return NextResponse.json({ data: result });
```

### Practice Session Flow
1. User fills form → validation with Zod schema
2. Submit to `/api/practice/submit`
3. API calls `aiRouter.generateFeedback()`
4. Response saved to database
5. User progress updated (streak, average score)
6. Feedback displayed with score visualization

### Common Gotchas
- NextAuth v5 uses different imports than v4 - always use `auth()` not `getServerSession()`
- Prisma arrays aren't supported in SQLite - use JSON strings
- AI providers need proper API keys in env vars
- Character limits are enforced in UI components: Goal (100), Main Points (50 each), Pitch (150)

## Testing AI Integration Locally
1. Set `AI_PROVIDER=anthropic` or `AI_PROVIDER=gemini` in `.env.local`
2. Add corresponding API key
3. Test with: `npm run dev` and submit a practice session
4. Check console for provider fallback behavior