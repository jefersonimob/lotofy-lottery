import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasUrl = !!process.env.DATABASE_URL
  const hasAuthSecret = !!process.env.AUTH_SECRET

  return NextResponse.json({
    ok: true,
    env: {
      DATABASE_URL: hasUrl,
      AUTH_SECRET: hasAuthSecret,
    },
  })
}
