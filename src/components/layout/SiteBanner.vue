<script setup lang="ts">
import GlitterText from '@/components/common/GlitterText.vue'
import { useSiteSettingsStore } from '@/stores/siteSettings'

const store = useSiteSettingsStore()
</script>

<template>
  <div>
    <GlitterText :text="store.settings?.siteTitle ?? 'CLAM'" />

    <div class="site-banner">
      <v-img v-if="store.settings?.bannerImageUrl" :src="store.settings.bannerImageUrl" height="220" cover />
      <div v-else class="site-banner-fallback" />
    </div>
  </div>
</template>

<style scoped>
.site-banner {
  border: 3px solid #fff;
  outline: 3px dashed rgb(var(--v-theme-primary));
  border-radius: 12px;
  overflow: hidden;
}
.site-banner-fallback {
  height: 160px;
  background: linear-gradient(120deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
}
</style>
