import { onBeforeUnmount, onMounted } from 'vue'

const EMOJIS = ['✨', '💖', '⭐']
const THROTTLE_MS = 90

export function useSparkleCursor() {
  let lastSpawn = 0

  function handleMove(event: MouseEvent) {
    const now = Date.now()
    if (now - lastSpawn < THROTTLE_MS) return
    lastSpawn = now

    const el = document.createElement('span')
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    el.className = 'sparkle-cursor-particle'
    el.style.left = `${event.clientX}px`
    el.style.top = `${event.clientY}px`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 700)
  }

  onMounted(() => window.addEventListener('mousemove', handleMove))
  onBeforeUnmount(() => window.removeEventListener('mousemove', handleMove))
}
