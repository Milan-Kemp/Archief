export interface YoutubeMetadata {
  videoId: string
  title: string | null
  author: string | null
  thumbnailUrl: string
}

/** Pakt het video-id uit watch?v=, youtu.be/, /shorts/, /live/, /embed/, incl. &t= of ?si=. */
export function extractYoutubeId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '')
  if (host === 'youtu.be') {
    return parsed.pathname.split('/')[1] || null
  }

  if (host !== 'youtube.com') return null

  if (parsed.pathname === '/watch') {
    return parsed.searchParams.get('v')
  }

  const match = parsed.pathname.match(/^\/(shorts|live|embed)\/([^/?]+)/)
  if (match) return match[2]

  return null
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/** Haalt titel + kanaal via oEmbed. Geeft null terug voor title/author bij CORS-fouten; altijd handmatig overschrijfbaar. */
export async function fetchYoutubeMetadata(url: string): Promise<YoutubeMetadata | null> {
  const videoId = extractYoutubeId(url)
  if (!videoId) return null

  const thumbnailUrl = youtubeThumbnailUrl(videoId)

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`,
      )}&format=json`,
    )
    if (!res.ok) return { videoId, title: null, author: null, thumbnailUrl }
    const data = await res.json()
    return {
      videoId,
      title: data.title ?? null,
      author: data.author_name ?? null,
      thumbnailUrl,
    }
  } catch {
    return { videoId, title: null, author: null, thumbnailUrl }
  }
}
