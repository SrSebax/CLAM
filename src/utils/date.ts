import type { Timestamp } from 'firebase/firestore'

export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const RELATIVE_UNITS: [seconds: number, label: string][] = [
  [31557600, 'año'],
  [2629800, 'mes'],
  [604800, 'semana'],
  [86400, 'día'],
  [3600, 'hora'],
  [60, 'minuto'],
]

/** Tiempo relativo estilo "hace 3 semanas" para timestamps recientes. */
export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return ''
  const diffSeconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000)
  if (diffSeconds < 30) return 'justo ahora'

  for (const [unitSeconds, label] of RELATIVE_UNITS) {
    const value = Math.floor(diffSeconds / unitSeconds)
    if (value >= 1) {
      return `hace ${value} ${value === 1 ? label : `${label}s`}`
    }
  }
  return 'hace un momento'
}
