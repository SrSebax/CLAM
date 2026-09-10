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

/** Extrae el ID de playlist (parámetro `list=`) de una URL de YouTube o YouTube Music.
 * Devuelve null si la URL no trae playlist. */
export function parseYoutubePlaylistId(url: string): string | null {
  const match = url.trim().match(/[?&]list=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/** Prefijo usado para distinguir un ID de playlist dentro de un array de IDs de video. */
export const PLAYLIST_ID_PREFIX = 'playlist:'

export function isPlaylistEntry(id: string): boolean {
  return id.startsWith(PLAYLIST_ID_PREFIX)
}

export function toPlaylistEntry(listId: string): string {
  return `${PLAYLIST_ID_PREFIX}${listId}`
}

export function fromPlaylistEntry(entry: string): string {
  return entry.slice(PLAYLIST_ID_PREFIX.length)
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export interface YoutubeOEmbed {
  title: string
  authorName: string
}

async function fetchOEmbedByUrl(url: string): Promise<YoutubeOEmbed | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
    if (!res.ok) return null
    const data = await res.json()
    return { title: data.title, authorName: data.author_name }
  } catch {
    return null
  }
}

/** Metadatos públicos vía oEmbed de YouTube (sin API key, CORS habilitado). */
export function fetchYoutubeOEmbed(videoId: string): Promise<YoutubeOEmbed | null> {
  return fetchOEmbedByUrl(`https://www.youtube.com/watch?v=${videoId}`)
}

/** Metadatos públicos (título, autor) de una playlist completa de YouTube. */
export function fetchYoutubePlaylistOEmbed(listId: string): Promise<YoutubeOEmbed | null> {
  return fetchOEmbedByUrl(`https://www.youtube.com/playlist?list=${listId}`)
}
