const PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
]

/** Extrae el ID de video de una URL de YouTube en cualquiera de sus formatos comunes.
 * Devuelve null si la URL no es reconocida como YouTube. */
export function parseYoutubeId(url: string): string | null {
  const trimmed = url.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export interface YoutubeOEmbed {
  title: string
  authorName: string
}

/** Metadatos públicos vía oEmbed de YouTube (sin API key, CORS habilitado). */
export async function fetchYoutubeOEmbed(videoId: string): Promise<YoutubeOEmbed | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
    )
    if (!res.ok) return null
    const data = await res.json()
    return { title: data.title, authorName: data.author_name }
  } catch {
    return null
  }
}
