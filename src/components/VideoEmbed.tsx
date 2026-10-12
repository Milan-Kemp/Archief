import { useState } from 'react'

interface Props {
  videoId: string
  thumbnailUrl: string | null
  title: string
  url: string
}

// Klik-om-af-te-spelen in plaats van de iframe direct te laden: scheelt een
// zware embed bij elke paginalaad en voorkomt dat er meteen een extra
// WebGL/compositor-context bijkomt bovenop de rest van de pagina.
export function VideoEmbed({ videoId, thumbnailUrl, title, url }: Props) {
  const [playing, setPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  if (playing && !videoError) {
    return (
      <div className="flex flex-col gap-2">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onError={() => setVideoError(true)}
          />
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Bekijk op YouTube ↗
        </a>
      </div>
    )
  }

  if (videoError) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full rounded-lg object-cover" />}
        <span className="mt-1 inline-block text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          Video kan hier niet worden ingeladen — bekijk op YouTube ↗
        </span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full overflow-hidden rounded-lg"
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-150 group-hover:bg-black/30">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-xl text-[#1C1C1A]">
          ▶
        </span>
      </span>
    </button>
  )
}
