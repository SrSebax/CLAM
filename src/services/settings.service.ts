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
  primaryColor: '#2A5DB0',
  secondaryColor: '#D9782E',
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
