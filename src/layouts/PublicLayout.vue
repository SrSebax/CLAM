<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MarqueeBar from '@/components/layout/MarqueeBar.vue'
import MusicPlayer from '@/components/layout/MusicPlayer.vue'
import SiteBanner from '@/components/layout/SiteBanner.vue'

import { useSparkleCursor } from '@/composables/useSparkleCursor'
import { useSiteSettingsStore } from '@/stores/siteSettings'

const siteSettings = useSiteSettingsStore()
useSparkleCursor()
</script>

<template>
  <v-app class="glitter-bg">
    <AppNavbar />

    <v-main>
      <MarqueeBar :text="siteSettings.settings?.marqueeText ?? ''" />
      <div class="page-frame">
        <v-container class="py-4 py-md-6" max-width="1200">
          <SiteBanner class="mb-6" />

          <v-row>
            <v-col cols="12" md="8">
              <router-view />
            </v-col>
            <v-col cols="12" md="4">
              <AppSidebar />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-main>

    <AppFooter />

    <MusicPlayer
      v-if="siteSettings.settings?.musicYoutubeIds.length"
      :video-ids="siteSettings.settings.musicYoutubeIds"
    />
  </v-app>
</template>

<style scoped>
.glitter-bg {
  background-color: rgb(var(--v-theme-page-bg));
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.9) 0, rgba(255, 255, 255, 0.9) 2px, transparent 3px),
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0.8) 2px, transparent 3px),
    radial-gradient(circle at 55% 15%, rgba(255, 255, 255, 0.9) 0, rgba(255, 255, 255, 0.9) 2px, transparent 3px),
    radial-gradient(circle at 75% 55%, rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0.8) 2px, transparent 3px),
    radial-gradient(circle at 90% 25%, rgba(255, 255, 255, 0.9) 0, rgba(255, 255, 255, 0.9) 2px, transparent 3px),
    radial-gradient(circle at 20% 90%, rgba(255, 255, 255, 0.8) 0, rgba(255, 255, 255, 0.8) 2px, transparent 3px);
  background-size: 140px 140px;
}
.page-frame {
  max-width: 1240px;
  margin: 0 auto;
  background: rgb(var(--v-theme-surface));
  min-height: 100%;
  border-left: 3px dashed rgb(var(--v-theme-primary));
  border-right: 3px dashed rgb(var(--v-theme-primary));
}
</style>
