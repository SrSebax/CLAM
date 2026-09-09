import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getSiteSettings } from '@/services/settings.service'
import type { SiteSettings } from '@/types'

export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const settings = ref<SiteSettings | null>(null)
  const loading = ref(false)
  let loaded = false

  async function load(force = false) {
    if (loaded && !force) return
    loading.value = true
    try {
      settings.value = await getSiteSettings()
      loaded = true
    } finally {
      loading.value = false
    }
  }

  return { settings, loading, load }
})
