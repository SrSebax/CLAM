<script setup lang="ts">
import type { PostAttachment } from '@/types'

defineProps<{ attachments: PostAttachment[] }>()

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div v-if="attachments.length" class="mt-8">
    <h2 class="text-h6 font-weight-bold mb-3">Archivos adjuntos</h2>
    <v-list density="comfortable" class="rounded-lg" border>
      <v-list-item
        v-for="file in attachments"
        :key="file.path"
        :href="file.url"
        target="_blank"
        rel="noopener"
        :title="file.name"
        :subtitle="formatSize(file.size)"
      >
        <template #prepend>
          <v-icon icon="mdi-file-download-outline" />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
