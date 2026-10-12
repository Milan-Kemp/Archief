import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { extractYoutubeId } from '../lib/youtube'
import { DOMAIN_COLORS, DOMAIN_LABELS } from '../lib/domain'
import { formatYearRange } from '../lib/year'
import { ItemForm } from '../components/ItemForm'
import { VideoEmbed } from '../components/VideoEmbed'
import type { Item } from '../types/item'
import type { ItemLocation } from '../types/location'

export function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<Item | null>(null)
  const [locations, setLocations] = useState<ItemLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function loadItem() {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single()
    if (error || !data) {
      setNotFound(true)
    } else {
      setItem(data)
      setNotes(data.notes)
      const { data: locationData } = await supabase
        .from('item_locations')
        .select('*')
        .eq('item_id', id)
      setLocations(locationData ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItem()
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
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
        <Link to="/" className="text-sm text-neutral-500 no-underline hover:text-neutral-800 dark:hover:text-neutral-200">
          ← Terug naar tijdlijn
        </Link>
        <button
          type="button"
          onClick={() => setShowEditForm(true)}
          className="text-sm text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Bewerken
        </button>
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
          {item.year_start !== null && (
            <p className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
              {formatYearRange(item.year_start, item.year_end, item.date_precision)}
            </p>
          )}
          {item.topic && <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.topic}</p>}
          {(locations.length > 0 || item.people.length > 0 || item.tags.length > 0) && (
            <div className="flex flex-col gap-1 pt-1 text-xs text-neutral-400 dark:text-neutral-500">
              {locations.length > 0 && (
                <p>Locaties: {locations.map((l) => l.name).join(', ')}</p>
              )}
              {item.people.length > 0 && <p>Personen: {item.people.join(', ')}</p>}
              {item.tags.length > 0 && <p>Tags: {item.tags.join(', ')}</p>}
            </div>
          )}
        </div>

        {item.type === 'video' && videoId && item.url && (
          <VideoEmbed
            videoId={videoId}
            thumbnailUrl={item.thumbnail_url}
            title={item.title}
            url={item.url}
          />
        )}

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

      {showEditForm && (
        <ItemForm
          item={item}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            setShowEditForm(false)
            loadItem()
          }}
        />
      )}
    </div>
  )
}
