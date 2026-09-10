<script setup lang="ts">
import { ref } from 'vue'

import { useToastStore } from '@/stores/toast'
import { parseYoutubeId, youtubeThumbnail } from '@/utils/youtube'

const videoIds = defineModel<string[]>({ required: true })

const toast = useToastStore()
const urlInput = ref('')

function addVideo() {
  const id = parseYoutubeId(urlInput.value)
  if (!id) {
    toast.error('No se reconoció esa URL de YouTube.')
    return
  }
  if (videoIds.value.includes(id)) {
    toast.error('Ese video ya está agregado.')
    return
  }
  videoIds.value = [...videoIds.value, id]
  urlInput.value = ''
}

function removeVideo(id: string) {
  videoIds.value = videoIds.value.filter((v) => v !== id)
}
</script>

<template>
  <div>
    <div class="d-flex ga-2 mb-3">
      <v-text-field
        v-model="urlInput"
        label="Pega una URL de YouTube"
        density="comfortable"
        hide-details
        @keyup.enter="addVideo"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="addVideo">Agregar</v-btn>
    </div>

    <div v-if="videoIds.length" class="video-grid">
      <div v-for="id in videoIds" :key="id" class="video-item">
        <v-img :src="youtubeThumbnail(id)" aspect-ratio="16/9" cover class="rounded" />
        <v-btn
          icon="mdi-close"
          size="small"
          color="error"
          variant="flat"
          class="remove-btn"
          @click="removeVideo(id)"
        />
      </div>
    </div>
    <p v-else class="text-caption text-medium-emphasis">Aún no has agregado canciones.</p>
  </div>
</template>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.video-item {
  position: relative;
}
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
