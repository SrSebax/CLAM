<script setup lang="ts">
import { useSiteSettingsStore } from '@/stores/siteSettings'

const store = useSiteSettingsStore()
</script>

<template>
  <div class="site-banner">
    <v-img v-if="store.settings?.bannerImageUrl" :src="store.settings.bannerImageUrl" height="220" cover />
    <div v-else class="site-banner-fallback d-flex align-center justify-center">
      <h1 class="text-h3 font-weight-bold text-white">{{ store.settings?.siteTitle ?? 'CLAM' }}</h1>
    </div>
  </div>
</template>

<style scoped>
.site-banner {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.site-banner-fallback {
  height: 220px;
  background: linear-gradient(120deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
}
</style>
