import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseYear, formatYearRange } from '../lib/year'
import { fetchYoutubeMetadata } from '../lib/youtube'
import { joinList, parseList } from '../lib/list'
import { CountryPicker } from './CountryPicker'
import type { Domain, DatePrecision, Item, ItemType } from '../types/item'

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
  item?: Item
  onSaved: () => void
  onClose: () => void
}

export function ItemForm({ item, onSaved, onClose }: Props) {
  const [url, setUrl] = useState(item?.url ?? '')
  const [type, setType] = useState<ItemType>(item?.type ?? 'video')
  const [title, setTitle] = useState(item?.title ?? '')
  const [author, setAuthor] = useState(item?.author ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(item?.thumbnail_url ?? null)
  const [domain, setDomain] = useState<Domain>(item?.domain ?? 'history')
  const [topic, setTopic] = useState(item?.topic ?? '')
  const [yearInput, setYearInput] = useState(
    item && item.year_start !== null ? formatYearInputDefault(item) : '',
  )
  const [precisionOverride, setPrecisionOverride] = useState<DatePrecision | null>(
    item?.date_precision ?? null,
  )
  const [countries, setCountries] = useState<string[]>(item?.countries ?? [])
  const [peopleInput, setPeopleInput] = useState(item ? joinList(item.people) : '')
  const [tagsInput, setTagsInput] = useState(item ? joinList(item.tags) : '')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const yearProvided = yearInput.trim() !== ''
  const parsedYear = yearProvided ? parseYear(yearInput) : null
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

    if (yearProvided && !parsedYear) {
      setError('Jaartal snap ik niet. Probeer -500, 500 v.Chr. of 1600s.')
      return
    }
    if (!title.trim()) {
      setError('Titel is verplicht.')
      return
    }

    setSaving(true)

    const payload = {
      type,
      url: url || null,
      title: title.trim(),
      author: author.trim() || null,
      thumbnail_url: thumbnailUrl,
      domain,
      topic: topic.trim() || null,
      year_start: parsedYear ? parsedYear.year_start : null,
      year_end: parsedYear ? parsedYear.year_end : null,
      date_precision: parsedYear ? precision : 'era',
      countries,
      people: parseList(peopleInput),
      tags: parseList(tagsInput),
      notes,
    }

    const { error: saveError } = item
      ? await supabase.from('items').update(payload).eq('id', item.id)
      : await supabase.from('items').insert({ ...payload, status: 'to_watch' })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl bg-[#FAFAF7] p-5 dark:bg-[#1c1c1a]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1C1C1A] dark:text-[#F5F5F2]">
            {item ? 'Item bewerken' : 'Item toevoegen'}
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
          Onderwerp / stroming
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="bv. Stoïcisme, Kwantummechanica"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Jaartal
          <input
            type="text"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            placeholder="optioneel — -500, 500 v.Chr., 1600s, 1618-1648"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-900"
          />
          {yearProvided && parsedYear && (
            <span className="text-xs text-neutral-500">
              → {formatYearRange(parsedYear.year_start, parsedYear.year_end, precision)}
            </span>
          )}
        </label>

        {yearProvided && (
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
        )}

        <div className="flex flex-col gap-1 text-sm">
          Landen
          <CountryPicker value={countries} onChange={setCountries} />
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Personen
          <input
            type="text"
            value={peopleInput}
            onChange={(e) => setPeopleInput(e.target.value)}
            placeholder="komma-gescheiden, bv. Socrates, Plato"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tags
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="komma-gescheiden, bv. stoïcisme, ethiek"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
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

function formatYearInputDefault(item: Item): string {
  if (item.year_start === null) return ''
  if (item.year_end !== null && item.year_end !== item.year_start) {
    return `${item.year_start}-${item.year_end}`
  }
  return String(item.year_start)
}
