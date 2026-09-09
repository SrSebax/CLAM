import { useTheme } from 'vuetify'

import type { SiteSettings } from '@/types'

/** Debe invocarse de forma síncrona dentro de setup() (requisito de useTheme de Vuetify).
 * Devuelve una función `applyColors` que sí puede llamarse luego desde un watcher o handler. */
export function useSiteTheme() {
  const theme = useTheme()

  function applyColors(settings: Pick<SiteSettings, 'primaryColor' | 'secondaryColor'>) {
    const current = theme.themes.value.clamLight?.colors
    if (!current) return
    if (settings.primaryColor) current.primary = settings.primaryColor
    if (settings.secondaryColor) current.secondary = settings.secondaryColor
  }

  return { applyColors }
}
