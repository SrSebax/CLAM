<script setup lang="ts">
import { ref } from 'vue'

import { useToastStore } from '@/stores/toast'
import {
  fromPlaylistEntry,
  isPlaylistEntry,
  parseYoutubeId,
  parseYoutubePlaylistId,
  toPlaylistEntry,
  youtubeThumbnail,
} from '@/utils/youtube'

const videoIds = defineModel<string[]>({ required: true })

const toast = useToastStore()
const urlInput = ref('')

function addVideo() {
  const playlistId = parseYoutubePlaylistId(urlInput.value)
  if (playlistId) {
    const entry = toPlaylistEntry(playlistId)
    if (videoIds.value.includes(entry)) {
      toast.error('Esa playlist ya está agregada.')
      return
    }
    videoIds.value = [...videoIds.value, entry]
    urlInput.value = ''
    return
  }

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
        label="Pega una URL de YouTube (video o playlist completa)"
        density="comfortable"
        hide-details
        @keyup.enter="addVideo"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="addVideo">Agregar</v-btn>
    </div>

    <div v-if="videoIds.length" class="video-grid">
      <div v-for="id in videoIds" :key="id" class="video-item">
        <v-img v-if="!isPlaylistEntry(id)" :src="youtubeThumbnail(id)" aspect-ratio="16/9" cover class="rounded" />
        <div v-else class="playlist-tile rounded">
          <span class="mdi mdi-playlist-music" />
          <span class="playlist-tile-label">Playlist</span>
          <span class="playlist-tile-id">{{ fromPlaylistEntry(id) }}</span>
        </div>
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
.playlist-tile {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: rgb(var(--v-theme-secondary));
  color: #fff;
}
.playlist-tile .mdi {
  font-size: 28px;
}
.playlist-tile-label {
  font-weight: 700;
  font-size: 0.8rem;
}
.playlist-tile-id {
  font-size: 0.65rem;
  opacity: 0.8;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
