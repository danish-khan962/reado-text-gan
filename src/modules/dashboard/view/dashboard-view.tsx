"use client"

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import MaxWidthContainer from '@/style/max-width-container'
import { cn } from '@/lib/utils'
import {
  Check,
  Copy,
  Download,
  GitCompare,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import React from 'react'

const TIERS = [
  { id: 'easy', label: 'Easy', hint: 'TL;DR' },
  { id: 'hard', label: 'Hard', hint: 'Analytical' },
  { id: 'editorial', label: 'Editorial', hint: 'Pro' },
] as const

type TierId = (typeof TIERS)[number]['id']

const STEPS = [
  { title: 'Reading your text', detail: 'Parsing and cleaning the input' },
  { title: 'Identifying key ideas', detail: 'Finding the most important points' },
  { title: 'Drafting the summary', detail: 'Writing in the selected tier' },
  { title: 'Polishing the output', detail: 'Checking clarity and flow' },
] as const

const STEP_MS = 1100
const HISTORY_KEY = 'summarizer-history'
const HISTORY_LIMIT = 10
const READING_WPM = 200

type Insights = { keyPoints: string[]; keywords: string[] }
type RunMeta = Insights & { tier: TierId; inputWords: number }
type HistoryItem = RunMeta & {
  id: string
  input: string
  summary: string
  createdAt: number
}
type GenResult = { summary: string; keyPoints?: string[]; keywords?: string[] }
type CompareState = { inputWords: number; summaries: Record<TierId, string> }

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

/* ---------- Local text helpers (used as fallback / for insights) ---------- */

const STOPWORDS = new Set(
  (
    'the and but for with about from into than then that this these those their there ' +
    'they them were been being have has had does did will would should could might may ' +
    'which who whom what when where why how also more most other some any each both ' +
    'just over under between through during very your you our its it is are was be as ' +
    'at by of to in on or if an we he she his her not can so such'
  ).split(' ')
)

const WORD_RE = /[a-z][a-z'-]{3,}/g

const splitSentences = (text: string) =>
  text
    .match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? []

const wordFrequency = (text: string) => {
  const freq = new Map<string, number>()
  for (const w of text.toLowerCase().match(WORD_RE) ?? []) {
    if (STOPWORDS.has(w)) continue
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  return freq
}

const extractKeywords = (text: string, n = 6) =>
  [...wordFrequency(text).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w)

const pickTop = (sentences: string[], k: number) => {
  const freq = wordFrequency(sentences.join(' '))
  return sentences
    .map((s, i) => {
      const words = s.toLowerCase().match(WORD_RE) ?? []
      const score =
        words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / Math.sqrt(words.length || 1)
      return { s, i, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
}

const clip = (s: string, max = 150) => (s.length > max ? `${s.slice(0, max).trimEnd()}…` : s)

const extractKeyPoints = (text: string, n = 3) =>
  pickTop(splitSentences(text), n).map((s) => clip(s))

const TIER_RATIO: Record<TierId, number> = { easy: 0.2, hard: 0.4, editorial: 0.6 }

// Local fallback so the demo still produces a result when the API isn't available
const localSummarize = (text: string, tier: TierId) => {
  const sentences = splitSentences(text)
  if (sentences.length === 0) return text.trim()
  const rank = TIERS.findIndex((t) => t.id === tier) + 1
  const take = Math.min(
    sentences.length,
    Math.max(rank, Math.round(sentences.length * TIER_RATIO[tier]))
  )
  return pickTop(sentences, take).join(' ')
}

const generate = async (text: string, tier: TierId): Promise<GenResult> => {
  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tier }),
    })
    if (!res.ok) throw new Error('Request failed')
    const data = await res.json()
    return {
      summary: (data.summary ?? '') as string,
      keyPoints: data.keyPoints,
      keywords: data.keywords,
    }
  } catch {
    return { summary: localSummarize(text, tier) }
  }
}

/* ---------- Formatting helpers ---------- */

const reductionPct = (original: number, summary: number) =>
  original > 0 ? Math.max(0, Math.round((1 - summary / original) * 100)) : 0

const formatSaved = (originalWords: number, summaryWords: number) => {
  const sec = Math.max(0, Math.round(((originalWords - summaryWords) / READING_WPM) * 60))
  if (sec < 60) return `~${sec} sec`
  return `~${Math.round((sec / 60) * 10) / 10} min`
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/* ---------- Small presentational pieces ---------- */

const StatCard = ({ value, label, bar }: { value: string; label: string; bar?: number }) => (
  <div className='flex flex-col gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-4'>
    <span className='text-2xl font-semibold tabular-nums text-neutral-900'>{value}</span>
    <span className='text-xs text-neutral-500'>{label}</span>
    {bar !== undefined && (
      <div className='mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-200'>
        <div
          className='h-full rounded-full bg-emerald-600 transition-all duration-700 ease-out'
          style={{ width: `${bar}%` }}
        />
      </div>
    )}
  </div>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className='text-xs font-medium uppercase tracking-wide text-neutral-500'>
    {children}
  </label>
)

const DashboardView = () => {
  const [tier, setTier] = React.useState<TierId>('easy')
  const [input, setInput] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [processing, setProcessing] = React.useState(false)
  const [step, setStep] = React.useState(0)

  const [lastRun, setLastRun] = React.useState<RunMeta | null>(null)
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [hydrated, setHydrated] = React.useState(false)
  const [compare, setCompare] = React.useState<CompareState | null>(null)
  const [comparing, setComparing] = React.useState(false)

  const progress = Math.round((step / STEPS.length) * 100)
  const summaryWords = countWords(summary)

  /* History persistence */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {}
  }, [history, hydrated])

  const handleCopy = async () => {
    if (!summary) return
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleExport = () => {
    if (!summary) return
    const tierLabel = TIERS.find((t) => t.id === (lastRun?.tier ?? tier))?.label
    const lines = [`# Summary (${tierLabel})`, '', summary]
    if (lastRun?.keyPoints.length) {
      lines.push('', '## Key takeaways', ...lastRun.keyPoints.map((p) => `- ${p}`))
    }
    if (lastRun?.keywords.length) {
      lines.push('', `**Keywords:** ${lastRun.keywords.join(', ')}`)
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const runSteps = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await sleep(STEP_MS)
    }
    setStep(STEPS.length)
    await sleep(400)
  }

  const typeOut = async (text: string) => {
    const words = text.split(/(\s+)/)
    // Keep typing under ~3s even for long summaries
    const delay = Math.min(25, Math.max(4, Math.floor(3000 / (words.length || 1))))
    let shown = ''
    for (const w of words) {
      shown += w
      setSummary(shown)
      await sleep(delay)
    }
  }

  const handleGenerate = async () => {
    if (!input.trim() || loading) return
    const runInput = input
    const runTier = tier
    setLoading(true)
    setProcessing(true)
    setSummary('')
    setLastRun(null)
    setStep(0)
    try {
      const [result] = await Promise.all([generate(runInput, runTier), runSteps()])
      setProcessing(false)
      await typeOut(result.summary)

      const meta: RunMeta = {
        tier: runTier,
        inputWords: countWords(runInput),
        keyPoints: result.keyPoints?.length ? result.keyPoints : extractKeyPoints(runInput),
        keywords: result.keywords?.length ? result.keywords : extractKeywords(runInput),
      }
      setLastRun(meta)
      setHistory((prev) =>
        [
          {
            ...meta,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            input: runInput.slice(0, 20000),
            summary: result.summary,
            createdAt: Date.now(),
          },
          ...prev,
        ].slice(0, HISTORY_LIMIT)
      )
    } catch {
      setProcessing(false)
      setSummary('Something went wrong while generating the summary. Please try again.')
    } finally {
      setProcessing(false)
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    if (!input.trim() || loading || comparing) return
    const text = input
    setComparing(true)
    setCompare(null)
    try {
      const [results] = await Promise.all([
        Promise.all(TIERS.map((t) => generate(text, t.id))),
        sleep(1800),
      ])
      const summaries = Object.fromEntries(
        TIERS.map((t, i) => [t.id, results[i].summary])
      ) as Record<TierId, string>
      setCompare({ inputWords: countWords(text), summaries })
    } finally {
      setComparing(false)
    }
  }

  const handleRestore = (item: HistoryItem) => {
    if (loading) return
    setTier(item.tier)
    setInput(item.input)
    setSummary(item.summary)
    setLastRun({
      tier: item.tier,
      inputWords: item.inputWords,
      keyPoints: item.keyPoints,
      keywords: item.keywords,
    })
    setCompare(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showInsights = !!lastRun && !!summary && !loading
  const lastTierLabel = TIERS.find((t) => t.id === lastRun?.tier)?.label

  return (
    <MaxWidthContainer>
      <form
        className='flex w-full flex-col gap-8'
        onSubmit={(e) => {
          e.preventDefault()
          handleGenerate()
        }}
      >
        {/* Tier selector */}
        <section className='flex flex-col gap-3'>
          <label className='text-xs font-medium uppercase tracking-wide text-neutral-500'>
            Verbosity & complexity
          </label>
          <div
            role='radiogroup'
            className='grid grid-cols-3 gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1'
          >
            {TIERS.map(({ id, label, hint }) => {
              const active = tier === id
              return (
                <button
                  key={id}
                  type='button'
                  role='radio'
                  aria-checked={active}
                  onClick={() => setTier(id)}
                  className={cn(
                    'flex flex-col items-center rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                    active
                      ? 'bg-linear-to-tl from-emerald-600 to-emerald-700 text-neutral-300 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  )}
                >
                  <span className='font-medium'>{label}</span>
                  <span className='text-xs text-neutral-100'>{hint}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Input / Output */}
        <section className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {/* Input */}
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Input</span>
              <span className='text-xs tabular-nums text-neutral-500'>
                {countWords(input)} words
              </span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste your article, document or research paper…'
              className='h-72 min-h-72 max-h-72 field-sizing-fixed overflow-y-auto resize-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-900'
            />
            <div className='flex flex-wrap justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={!input}
                onClick={() => setInput('')}
                className='text-neutral-500 hover:text-neutral-900'
              >
                <X className='h-3.5 w-3.5' />
                Clear
              </Button>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={!input.trim() || loading || comparing}
                onClick={handleCompare}
                className='text-neutral-500 hover:text-neutral-900'
              >
                {comparing ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <GitCompare className='h-3.5 w-3.5' />
                )}
                Compare tiers
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Sparkles className='h-3.5 w-3.5' />
                )}
                {loading ? 'Generating…' : 'Generate summary'}
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Summary</span>
              <span className='text-xs tabular-nums text-neutral-500'>
                {summaryWords} words
              </span>
            </div>

            {processing ? (
              <div
                role='status'
                aria-live='polite'
                className='flex h-72 min-h-72 max-h-72 flex-col justify-between rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm'
              >
                <ul className='flex flex-col gap-4'>
                  {STEPS.map(({ title, detail }, i) => {
                    const done = step > i
                    const active = step === i
                    return (
                      <li
                        key={title}
                        className={cn(
                          'flex items-start gap-3 transition-opacity duration-300',
                          !done && !active && 'opacity-40'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                            done
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : active
                              ? 'border-neutral-900 text-neutral-900'
                              : 'border-neutral-300 text-transparent'
                          )}
                        >
                          {done ? (
                            <Check className='h-3 w-3' />
                          ) : active ? (
                            <Loader2 className='h-3 w-3 animate-spin' />
                          ) : null}
                        </span>
                        <span className='flex flex-col'>
                          <span className={cn('font-medium', active && 'text-neutral-900')}>
                            {title}
                          </span>
                          <span className='text-xs text-neutral-500'>{detail}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className='flex flex-col gap-2'>
                  <div className='h-1 w-full overflow-hidden rounded-full bg-neutral-200'>
                    <div
                      className='h-full rounded-full bg-emerald-600 transition-all duration-700 ease-out'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className='text-xs tabular-nums text-neutral-500'>{progress}%</span>
                </div>
              </div>
            ) : (
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder='Your summary will appear here…'
                className='h-72 min-h-72 max-h-72 field-sizing-fixed overflow-y-auto resize-none border-neutral-200 bg-neutral-50 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-900'
                readOnly
              />
            )}

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={!summary || loading}
                onClick={handleExport}
                className='text-neutral-500 hover:text-neutral-900'
              >
                <Download className='h-3.5 w-3.5' />
                Export
              </Button>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={!summary || loading}
                onClick={handleCopy}
                className='text-neutral-500 hover:text-neutral-900'
              >
                {copied ? (
                  <Check className='h-3.5 w-3.5' />
                ) : (
                  <Copy className='h-3.5 w-3.5' />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </section>

        {/* Insights */}
        {showInsights && lastRun && (
          <section className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <SectionLabel>Insights</SectionLabel>
              <span className='text-xs text-neutral-500'>{lastTierLabel} tier</span>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <StatCard value={String(lastRun.inputWords)} label='Words in original' />
              <StatCard value={String(summaryWords)} label='Words in summary' />
              <StatCard
                value={`${reductionPct(lastRun.inputWords, summaryWords)}%`}
                label='Shorter than original'
                bar={reductionPct(lastRun.inputWords, summaryWords)}
              />
              <StatCard
                value={formatSaved(lastRun.inputWords, summaryWords)}
                label='Reading time saved'
              />
            </div>

            {(lastRun.keyPoints.length > 0 || lastRun.keywords.length > 0) && (
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                {lastRun.keyPoints.length > 0 && (
                  <div className='rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:col-span-2'>
                    <span className='text-sm font-medium'>Key takeaways</span>
                    <ul className='mt-3 flex flex-col gap-2 text-sm text-neutral-700'>
                      {lastRun.keyPoints.map((p, i) => (
                        <li key={`${i}-${p}`} className='flex gap-2'>
                          <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600' />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {lastRun.keywords.length > 0 && (
                  <div className='rounded-xl border border-neutral-200 bg-neutral-50 p-4'>
                    <span className='text-sm font-medium'>Keywords</span>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {lastRun.keywords.map((k) => (
                        <span
                          key={k}
                          className='rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600'
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tier comparison */}
        {(comparing || compare) && (
          <section className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <SectionLabel>Tier comparison</SectionLabel>
              {compare && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setCompare(null)}
                  className='text-neutral-500 hover:text-neutral-900'
                >
                  <X className='h-3.5 w-3.5' />
                  Close
                </Button>
              )}
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {TIERS.map(({ id, label, hint }) => {
                const text = compare?.summaries[id]
                const words = text ? countWords(text) : 0
                return (
                  <div
                    key={id}
                    className='flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        {label}{' '}
                        <span className='text-xs font-normal text-neutral-500'>({hint})</span>
                      </span>
                      {compare && (
                        <span className='text-xs tabular-nums text-neutral-500'>
                          {words} words · {reductionPct(compare.inputWords, words)}% shorter
                        </span>
                      )}
                    </div>

                    {comparing || !compare ? (
                      <div className='flex animate-pulse flex-col gap-2'>
                        <div className='h-3 w-full rounded bg-neutral-200' />
                        <div className='h-3 w-11/12 rounded bg-neutral-200' />
                        <div className='h-3 w-4/5 rounded bg-neutral-200' />
                        <div className='h-3 w-2/3 rounded bg-neutral-200' />
                      </div>
                    ) : (
                      <p className='max-h-56 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-neutral-700'>
                        {text}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <SectionLabel>History</SectionLabel>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setHistory([])}
                className='text-neutral-500 hover:text-neutral-900'
              >
                Clear all
              </Button>
            </div>
            <ul className='divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200'>
              {history.map((item) => {
                const tierLabel = TIERS.find((t) => t.id === item.tier)?.label
                return (
                  <li
                    key={item.id}
                    className='flex items-center gap-3 bg-white px-4 py-3 text-sm transition-colors hover:bg-neutral-50'
                  >
                    <button
                      type='button'
                      onClick={() => handleRestore(item)}
                      className='flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 text-left'
                    >
                      <span className='truncate text-neutral-900'>
                        {item.summary || item.input}
                      </span>
                      <span className='text-xs text-neutral-500'>
                        {tierLabel} · {item.inputWords} → {countWords(item.summary)} words ·{' '}
                        {formatDate(item.createdAt)}
                      </span>
                    </button>
                    <button
                      type='button'
                      aria-label='Delete from history'
                      onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                      className='cursor-pointer rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </form>
    </MaxWidthContainer>
  )
}

export default DashboardView