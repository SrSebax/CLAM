import { onBeforeUnmount, ref } from 'vue'

// Tipado mínimo del SDK global de YouTube IFrame API (no se instala @types/youtube
// para no añadir una dependencia solo por unos pocos tipos).
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  loadVideoById(videoId: string): void
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}
interface YTPlayerOptions {
  videoId: string
  playerVars?: Record<string, number | string>
  events?: {
    onReady?: () => void
    onStateChange?: (event: { data: number }) => void
  }
}
declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<void> | null = null

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiLoadPromise
}

/** Reproductor de YouTube (solo audio, iframe oculto) con soporte de playlist:
 * `loadVideo(id)` cambia de canción reutilizando la misma instancia del player. */
export function useYoutubePlayer(elementId: string, onEnded?: () => void) {
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const ready = ref(false)
  let player: YTPlayer | null = null
  let pollInterval: ReturnType<typeof setInterval> | null = null

  function stopPolling() {
    if (pollInterval) clearInterval(pollInterval)
    pollInterval = null
  }

  function startPolling() {
    stopPolling()
    pollInterval = setInterval(() => {
      if (!player) return
      currentTime.value = player.getCurrentTime()
      duration.value = player.getDuration()
    }, 500)
  }

  async function create(initialId: string) {
    await loadYoutubeApi()
    if (!window.YT) return

    player = new window.YT.Player(elementId, {
      videoId: initialId,
      playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: () => {
          ready.value = true
          duration.value = player?.getDuration() ?? 0
        },
        onStateChange: (event) => {
          const YT = window.YT!
          if (event.data === YT.PlayerState.PLAYING) {
            playing.value = true
            startPolling()
          } else if (event.data === YT.PlayerState.PAUSED) {
            playing.value = false
            stopPolling()
          } else if (event.data === YT.PlayerState.ENDED) {
            playing.value = false
            stopPolling()
            onEnded?.()
          }
        },
      },
    })
  }

  function loadVideo(id: string) {
    currentTime.value = 0
    duration.value = 0
    if (player && ready.value) {
      player.loadVideoById(id)
    } else {
      void create(id)
    }
  }

  onBeforeUnmount(() => {
    stopPolling()
    player?.destroy()
  })

  function toggle() {
    if (!player) return
    if (playing.value) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  function seekTo(seconds: number) {
    player?.seekTo(seconds, true)
    currentTime.value = seconds
  }

  return { playing, currentTime, duration, toggle, seekTo, loadVideo }
}
