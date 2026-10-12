import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseYear, formatYearRange } from '../lib/year'
import { fetchYoutubeMetadata } from '../lib/youtube'
import type { Domain, DatePrecision, ItemType } from '../types/item'

const DOMAINS: { value: Domain; label: string }[] = [
  { value: 'history', label: 'Geschiedenis' },
  { value: 'philosophy', label: 'Filosofie' },
  { value: 'science', label: 'Wetenschap' },
]

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: 'exact', label: 'Exact' },
  { value: 'decade', label: 'Decennium' },
  { value: 'century', label: 'Eeuw' },
  { value: 'era', label: 'Tijdperk' },
]

interface Props {
  onAdded: () => void
  onClose: () => void
}

export function AddItemForm({ onAdded, onClose }: Props) {
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ItemType>('video')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [domain, setDomain] = useState<Domain>('history')
  const [yearInput, setYearInput] = useState('')
  const [precisionOverride, setPrecisionOverride] = useState<DatePrecision | null>(null)
  const [notes, setNotes] = useState('')
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const parsedYear = yearInput ? parseYear(yearInput) : null
  const precision = precisionOverride ?? parsedYear?.date_precision ?? 'exact'

  async function handleUrlBlur() {
    if (!url) return
    setFetchingMeta(true)
    const meta = await fetchYoutubeMetadata(url)
    setFetchingMeta(false)
    if (!meta) return

    setType('video')
    setThumbnailUrl(meta.thumbnailUrl)
    if (meta.title) setTitle(meta.title)
    if (meta.author) setAuthor(meta.author)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!domain) {
      setError('Domein is verplicht.')
      return
    }
    if (!parsedYear) {
      setError('Jaartal snap ik niet. Probeer -500, 500 v.Chr. of 1600s.')
      return
    }
    if (!title.trim()) {
      setError('Titel is verplicht.')
      return
    }

    setSaving(true)

    const { error: insertError } = await supabase.from('items').insert({
      type,
      url: url || null,
      title: title.trim(),
      author: author.trim() || null,
      thumbnail_url: thumbnailUrl,
      domain,
      year_start: parsedYear.year_start,
      year_end: parsedYear.year_end,
      date_precision: precision,
      notes,
      status: 'to_watch',
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    onAdded()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl bg-[#FAFAF7] p-5 dark:bg-[#1c1c1a]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1C1C1A] dark:text-[#F5F5F2]">
            Item toevoegen
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Sluiten
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          URL
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="https://youtube.com/watch?v=..."
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          {fetchingMeta && <span className="text-xs text-neutral-500">Metadata ophalen...</span>}
        </label>

        {thumbnailUrl && (
          <img src={thumbnailUrl} alt="" className="h-28 w-full rounded-lg object-cover" />
        )}

        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ItemType)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="video">Video</option>
            <option value="book">Boek</option>
            <option value="article">Artikel</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Titel *
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Auteur / kanaal
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Domein *
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Jaartal *
          <input
            type="text"
            required
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            placeholder="-500, 500 v.Chr., 1600s, 1618-1648"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-900"
          />
          {parsedYear && (
            <span className="text-xs text-neutral-500">
              → {formatYearRange(parsedYear.year_start, parsedYear.year_end, precision)}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Precisie
          <select
            value={precision}
            onChange={(e) => setPrecisionOverride(e.target.value as DatePrecision)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {PRECISIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notities
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 rounded-lg bg-[#1C1C1A] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-[#1C1C1A]"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </form>
    </div>
  )
}
