<script setup lang="ts">
import { computed, ref } from 'vue'

import type { PostAttachment } from '@/types'

defineProps<{ images: PostAttachment[] }>()

const selected = ref<string | null>(null)
const dialogOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})
</script>

<template>
  <div v-if="images.length" class="mt-8">
    <h2 class="text-h6 font-weight-bold mb-3">Galería</h2>
    <div class="gallery-grid">
      <v-img
        v-for="img in images"
        :key="img.path"
        :src="img.url"
        height="140"
        cover
        class="rounded-lg cursor-pointer bg-grey-lighten-3"
        @click="selected = img.url"
      />
    </div>

    <v-dialog v-model="dialogOpen" max-width="900">
      <v-img :src="selected ?? undefined" />
    </v-dialog>
  </div>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
