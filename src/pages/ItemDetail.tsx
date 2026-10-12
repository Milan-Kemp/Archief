import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { extractYoutubeId } from '../lib/youtube'
import { DOMAIN_COLORS, DOMAIN_LABELS } from '../lib/domain'
import { formatYearRange } from '../lib/year'
import type { Item } from '../types/item'

export function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setItem(data)
          setNotes(data.notes)
        }
        setLoading(false)
      })
  }, [id])

  async function saveNotes() {
    if (!item) return
    setSaveState('saving')
    const { error } = await supabase.from('items').update({ notes }).eq('id', item.id)
    setSaveState(error ? 'idle' : 'saved')
  }

  if (loading) return null

  if (notFound || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAFAF7] dark:bg-[#161614]">
        <p className="text-sm text-neutral-500">Item niet gevonden.</p>
        <Link to="/" className="text-sm underline">
          Terug naar tijdlijn
        </Link>
      </div>
    )
  }

  const videoId = item.type === 'video' && item.url ? extractYoutubeId(item.url) : null

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
      <header className="border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
        <Link to="/" className="text-sm text-neutral-500 no-underline hover:text-neutral-800 dark:hover:text-neutral-200">
          ← Terug naar tijdlijn
        </Link>
      </header>

      <main className="mx-auto flex flex-col gap-6 px-4 py-8" style={{ maxWidth: '65ch' }}>
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: DOMAIN_COLORS[item.domain] }}
            />
            {DOMAIN_LABELS[item.domain]}
          </span>
          <h1 className="font-serif text-2xl leading-tight">{item.title}</h1>
          {item.author && <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.author}</p>}
          <p className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
            {formatYearRange(item.year_start, item.year_end, item.date_precision)}
          </p>
        </div>

        {item.type === 'video' &&
          (videoId && !videoError ? (
            <div className="flex flex-col gap-2">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={item.title}
                  allow="accelerate-compute; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  onError={() => setVideoError(true)}
                />
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Bekijk op YouTube ↗
                </a>
              )}
            </div>
          ) : (
            item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className="block">
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt="" className="w-full rounded-lg object-cover" />
                )}
                <span className="mt-1 inline-block text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                  Video kan hier niet worden ingeladen — bekijk op YouTube ↗
                </span>
              </a>
            )
          ))}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Notities</h2>
            <div className="flex items-center gap-2">
              {saveState === 'saved' && !editingNotes && (
                <span className="text-xs text-neutral-400">Opgeslagen</span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (editingNotes) saveNotes()
                  setEditingNotes(!editingNotes)
                }}
                className="text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                {editingNotes ? 'Klaar' : 'Bewerken'}
              </button>
            </div>
          </div>

          {editingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setSaveState('idle')
              }}
              onBlur={saveNotes}
              rows={12}
              placeholder="Markdown-notities..."
              className="rounded-lg border border-neutral-300 bg-white p-3 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-900"
            />
          ) : notes ? (
            <div className="markdown-body font-serif text-base leading-relaxed">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Nog geen notities.</p>
          )}
        </div>
      </main>
    </div>
  )
}
