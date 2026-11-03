import { NextResponse } from 'next/server'
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { summaries } from '@/lib/db/schema'
import { getSession } from '@/lib/session'
import { HISTORY_LIMIT, toClient } from '@/lib/summaries'

const TIERS = ['easy', 'hard', 'editorial'] as const

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const cleanStrings = (value: unknown, max: number) =>
  Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === 'string')
        .slice(0, max)
        .map((s) => s.slice(0, 500))
    : []

// List the signed-in user's history (newest first)
export async function GET() {
  const session = await getSession()
  if (!session) return unauthorized()

  const rows = await db
    .select()
    .from(summaries)
    .where(eq(summaries.userId, session.user.id))
    .orderBy(desc(summaries.createdAt))
    .limit(HISTORY_LIMIT)

  return NextResponse.json(rows.map(toClient))
}

// Save a new summary to the signed-in user's history
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  const tier = TIERS.find((t) => t === body?.tier)
  const input = typeof body?.input === 'string' ? body.input.slice(0, 20000) : ''
  const summary = typeof body?.summary === 'string' ? body.summary : ''

  if (!tier || !input.trim() || !summary.trim()) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const inputWords = Number.isFinite(body.inputWords)
    ? Math.max(0, Math.floor(body.inputWords))
    : 0

  const [row] = await db
    .insert(summaries)
    .values({
      userId: session.user.id,
      tier,
      input,
      summary,
      inputWords,
      keyPoints: cleanStrings(body.keyPoints, 10),
      keywords: cleanStrings(body.keywords, 12),
    })
    .returning()

  // Keep only the newest HISTORY_LIMIT entries per user
  const stale = await db
    .select({ id: summaries.id })
    .from(summaries)
    .where(eq(summaries.userId, session.user.id))
    .orderBy(desc(summaries.createdAt))
    .offset(HISTORY_LIMIT)

  if (stale.length > 0) {
    await db.delete(summaries).where(
      inArray(
        summaries.id,
        stale.map((s) => s.id)
      )
    )
  }

  return NextResponse.json(toClient(row), { status: 201 })
}

// Clear the signed-in user's whole history
export async function DELETE() {
  const session = await getSession()
  if (!session) return unauthorized()

  await db.delete(summaries).where(eq(summaries.userId, session.user.id))
  return NextResponse.json({ ok: true })
}
