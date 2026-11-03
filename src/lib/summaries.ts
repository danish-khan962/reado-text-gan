import type { summaries } from '@/lib/db/schema'

export const HISTORY_LIMIT = 20

type SummaryRow = typeof summaries.$inferSelect

// Shape the dashboard expects (createdAt as a millisecond timestamp)
export const toClient = (r: SummaryRow) => ({
  id: r.id,
  tier: r.tier,
  input: r.input,
  summary: r.summary,
  inputWords: r.inputWords,
  keyPoints: r.keyPoints,
  keywords: r.keywords,
  createdAt: r.createdAt.getTime(),
})
