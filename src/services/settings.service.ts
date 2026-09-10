import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { SiteSettings } from '@/types'

const settingsRef = doc(db, 'settings', 'site')

const DEFAULTS: SiteSettings = {
  bannerImageUrl: null,
  bannerImagePath: null,
  siteTitle: 'CLAM',
  welcomeTitle: 'Bienvenidos',
  welcomeText: 'Un espacio para publicar, descubrir y conversar sobre las ideas que importan.',
  primaryColor: '#FF1493',
  secondaryColor: '#9B30FF',
  marqueeText: '★ GRACIAS POR VISITAR MI BLOG ★ DEJA UN COMENTARIO ★ VUELVE PRONTO ★',
  musicYoutubeIds: [],
  playlistYoutubeIds: [],
  updatedAt: null,
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(settingsRef)
  if (!snap.exists()) return DEFAULTS
  return { ...DEFAULTS, ...(snap.data() as Partial<SiteSettings>) }
}

export async function updateSiteSettings(data: Omit<SiteSettings, 'updatedAt'>): Promise<void> {
  await setDoc(settingsRef, { ...data, updatedAt: serverTimestamp() })
}
