import type { Timestamp } from 'firebase/firestore'

export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
