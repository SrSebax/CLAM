<script setup lang="ts">
import { onMounted, watch } from 'vue'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ToastHost from '@/components/common/ToastHost.vue'
import { useSiteTheme } from '@/composables/useSiteTheme'
import { useSiteSettingsStore } from '@/stores/siteSettings'

const siteSettings = useSiteSettingsStore()
const { applyColors } = useSiteTheme()

onMounted(() => siteSettings.load())

watch(
  () => siteSettings.settings,
  (settings) => {
    if (settings) applyColors(settings)
  },
)
</script>

<template>
  <router-view />
  <ToastHost />
  <ConfirmDialog />
</template>
