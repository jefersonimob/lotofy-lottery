# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lotofy is a Next.js 14 lottery prediction platform for Brazil's Lotofácil lottery. It provides statistical analysis of historical draw data, generates AI-powered number predictions, and allows users to track their predictions. The app integrates with external lottery APIs and uses Supabase for authentication and data persistence.

## Development Commands

### Essential Commands
```bash
npm run dev              # Start development server (port 3000)
npm run build           # Production build
npm run lint            # Run ESLint - ALWAYS run after changes
npm run type-check      # TypeScript type checking - ALWAYS run after changes
npm start               # Start production server
```

### Specialized Scripts
```bash
npm run build:analyze      # Analyze bundle size
npm run import-all-games   # Populate all_possible_games table (3.2M combinations)
npm run export            # Static export
```

### Testing Individual Features
```bash
# Test API routes directly
curl http://localhost:3000/api/lottery-results?limit=5
curl http://localhost:3000/api/statistics
curl http://localhost:3000/api/all-games?oddCount=7,8&sumMin=150

# Test with authenticated user (copy session cookie from browser)
curl -H "Cookie: sb-access-token=..." http://localhost:3000/api/predictions
```

## Architecture Overview

### Core Application Flow
1. **Entry Point**: Middleware ([middleware.ts](middleware.ts)) handles session refresh for all requests using Supabase SSR
2. **Authentication**: Server-side session management via cookies; client uses [lib/supabase/client.ts](lib/supabase/client.ts)
3. **Data Sources** (priority order):
   - Local Excel file (`/resultados/Lotofácil.xlsx`) - highest priority
   - Supabase database
   - External Caixa API (fallback)
4. **UI Layer**: Server Components for data fetching + Client Components for interactivity
5. **Custom Hooks**: [lib/hooks/use-lottery-data.ts](lib/hooks/use-lottery-data.ts) abstracts API calls

### Directory Structure
```
/app
  /api              - API routes (lottery-results, predictions, statistics, all-games, admin)
  /auth             - Login/signup pages (client components)
  /admin            - Admin dashboard (role='admin' required)
  /dashboard        - User dashboard (authenticated)
/components
  /ui               - Shadcn/Radix base components
  /admin            - Admin-specific components
  /dashboard        - Dashboard feature components
  /analytics        - Chart components (Recharts)
/lib
  /supabase         - Client configurations (server.ts, client.ts, admin.ts)
  /services         - External integrations (caixa-api.ts)
  /hooks            - Custom React hooks
/scripts            - Database utilities (import-all-games.ts)
```

### Key Architectural Patterns

**Supabase Client Strategy:**
- **Server Components/API Routes**: Use `createClient()` from [lib/supabase/server.ts](lib/supabase/server.ts)
- **Client Components**: Use `createClient()` from [lib/supabase/client.ts](lib/supabase/client.ts)
- **Admin Operations**: Use `createAdminClient()` from [lib/supabase/admin.ts](lib/supabase/admin.ts) (bypasses RLS)
- **Graceful Degradation**: All clients return stub implementations if env vars missing

**Data Fetching Pattern:**
```typescript
// Server Component (preferred for initial data)
async function Page() {
  const supabase = createClient()
  const { data } = await supabase.from('table').select()
  return <Component data={data} />
}

// Client Component (for interactive/dynamic data)
function Component() {
  const { data, loading } = useLotteryResults(10) // custom hook
  return <div>{data?.map(...)}</div>
}
```

**Authentication & Authorization:**
- Protected pages check `supabase.auth.getUser()` server-side and redirect to `/auth/login` if null
- Admin pages additionally check `profiles.role === 'admin'`
- Row-Level Security (RLS) enabled on Supabase tables
- Service role key used only server-side for admin operations

## Database Schema

### Core Tables
- `lottery_results` - Historical draw data (contest_number, date, drawn_numbers[])
- `profiles` - User profiles (email, full_name, role: 'user'|'admin')
- `user_predictions` - User-saved predictions
- `number_statistics` - Precomputed frequency stats (hot/cold numbers)
- `all_possible_games` - All 3,268,760 combinations (sum, odd_count, even_count, has_sequence)

### Setup & Migrations
SQL scripts in `/scripts/` directory (numbered 001-008):
1. Create tables
2. Enable RLS policies
3. Create functions
4. Seed sample data
5. Create profile trigger
6. Add admin roles
7. Update profiles table
8. Add prize tracking

Run in order via Supabase SQL Editor (see [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md)).

## External Integrations

### Caixa API Service
- **File**: [lib/services/caixa-api.ts](lib/services/caixa-api.ts)
- **Base URL**: `https://loteriascaixa-api.herokuapp.com/api`
- **Methods**:
  - `getLatestResult()` - Fetch most recent draw
  - `getResultByContest(number)` - Specific contest
  - `updateAllHistoricalResults()` - Batch sync with 100ms delays
  - `syncLatestResult()` - Update DB if new draw available

### Data Prioritization Logic
See [app/api/lottery-results/route.ts](app/api/lottery-results/route.ts):
1. Try local Excel file (`/resultados/Lotofácil.xlsx`)
2. Fall back to Supabase DB
3. Fall back to external Caixa API
4. Return user-friendly error if all fail

## Important Development Rules

### Pre-Commit Checklist
- **ALWAYS** run `npm run lint` after code changes
- **ALWAYS** run `npm run type-check` after code changes
- **NEVER** start dev server yourself - ask user to provide terminal output if needed
- **NEVER** commit changes without running lint and type-check

### Component & Import Guidelines
- When importing code from other systems, validate all imports
- Check icon availability in lucide-react (icons may differ between systems)
- If source uses newer package version, adapt code to current package versions
- Example: Material-UI v5 → v4 requires API adjustments

### Styling Guidelines
- Use standard Tailwind and Shadcn colors/tokens
- Avoid custom colors unless specifically instructed
- Leverage CSS variables: `primary`, `accent`, `destructive`, etc.
- Components in `/components/ui/` are Shadcn base components - edit carefully

### Translation/i18n Requirements
- **ALWAYS** create translation keys/values when creating/modifying pages or components
- Current language: Portuguese (pt-BR)
- Translation system not yet implemented (prepare for future i18n library)

## API Route Patterns

### Standard Structure
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('table').select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Friendly error message' },
      { status: 500 }
    )
  }
}
```

### Admin Routes
Prefix with `/api/admin/*` and use `createAdminClient()` to bypass RLS:
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createAdminClient()
  // Admin operations...
}
```

## Custom Hooks Reference

See [lib/hooks/use-lottery-data.ts](lib/hooks/use-lottery-data.ts):

```typescript
// Fetch recent lottery results
const { data, loading, error } = useLotteryResults(limit)

// Fetch number frequency statistics
const { data, loading, error } = useNumberStatistics()

// User predictions (authenticated)
const { predictions, loading, error, savePrediction } = useUserPredictions()

// Generate AI prediction
const { generatePrediction, loading, error } = useGeneratePrediction()
```

## Common Development Tasks

### Adding New API Route
1. Create file in `/app/api/your-route/route.ts`
2. Import appropriate Supabase client (server/admin)
3. Handle errors gracefully with try/catch
4. Return `NextResponse.json()` for consistency
5. Update this file with endpoint documentation

### Adding Protected Page
1. Create page in `/app/your-route/page.tsx`
2. Make component `async` for server-side auth check
3. Add auth check at top:
   ```typescript
   const supabase = createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/auth/login')
   ```
4. For admin pages, also check `profiles.role === 'admin'`

### Creating New Component
1. Determine if Server or Client Component needed
2. Use `"use client"` directive only if needed (state, events, hooks)
3. Import UI components from `/components/ui/*`
4. Use `cn()` utility from [lib/utils.ts](lib/utils.ts) for className merging
5. Add translation keys for all user-facing text

### Modifying Database Schema
1. Create new SQL migration file in `/scripts/`
2. Test locally in Supabase SQL Editor
3. Update TypeScript types if needed
4. Update RLS policies if creating new table
5. Document in this file's Database Schema section

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

**Security**: Never commit `.env.local` to git. Service role key must never be exposed to client.

## Deployment

### Platform: Vercel (recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Auto-deploys on push to main branch

### Configuration
- **Output**: Standalone (Docker-compatible) via [next.config.mjs](next.config.mjs)
- **Images**: Unoptimized for broader compatibility
- **Build**: Strict mode (no ignored errors/warnings)
- **Server**: Keep-alive enabled, ETags generated

See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) for detailed deployment steps.

## Troubleshooting

### "Unauthorized" when accessing /admin
- Check user's `role` in `profiles` table
- Run: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com'`

### API returns 500 errors
- Check Supabase connection (verify env vars)
- Review RLS policies (may be blocking access)
- Check server logs for detailed error messages

### Type errors during build
- Run `npm run type-check` locally first
- Check for missing imports or incorrect types
- Verify Supabase client usage (server vs client)

### Excel file not loading
- Ensure `/resultados/Lotofácil.xlsx` exists
- Check file permissions
- API will fall back to Supabase → Caixa API

## Key Files to Know

**Authentication & Sessions:**
- [middleware.ts](middleware.ts) - Session refresh on all requests
- [lib/supabase/server.ts](lib/supabase/server.ts) - Server-side client
- [lib/supabase/client.ts](lib/supabase/client.ts) - Browser client
- [lib/supabase/admin.ts](lib/supabase/admin.ts) - Admin client (bypasses RLS)

**Data Layer:**
- [app/api/lottery-results/route.ts](app/api/lottery-results/route.ts) - Core data fetching logic
- [lib/services/caixa-api.ts](lib/services/caixa-api.ts) - External API integration
- [lib/hooks/use-lottery-data.ts](lib/hooks/use-lottery-data.ts) - React hooks for UI

**Main Pages:**
- [app/page.tsx](app/page.tsx) - Landing page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - User dashboard
- [app/admin/page.tsx](app/admin/page.tsx) - Admin dashboard

**Configuration:**
- [next.config.mjs](next.config.mjs) - Next.js configuration
- [tsconfig.json](tsconfig.json) - TypeScript settings (path alias: `@/*`)
- [package.json](package.json) - Dependencies and scripts

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Shadcn/Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Fonts**: Geist (Sans + Mono)
- **Deployment**: Vercel / Docker (standalone output)
