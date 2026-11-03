import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { summaries } from '@/lib/db/schema'
import { getSession } from '@/lib/session'

// Delete one history item (only if it belongs to the signed-in user)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await db
    .delete(summaries)
    .where(and(eq(summaries.id, id), eq(summaries.userId, session.user.id)))

  return NextResponse.json({ ok: true })
}
