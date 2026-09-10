<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useYoutubePlayer } from '@/composables/useYoutubePlayer'
import {
  fetchYoutubeOEmbed,
  fetchYoutubePlaylistOEmbed,
  fromPlaylistEntry,
  isPlaylistEntry,
  youtubeThumbnail,
} from '@/utils/youtube'

const props = defineProps<{ videoIds: string[] }>()

const currentIndex = ref(0)
const currentId = computed(() => props.videoIds[currentIndex.value] ?? null)
const showList = ref(false)

const yt = useYoutubePlayer('yt-playlist-player-target', () => next())

const title = ref('')
const artist = ref('')

async function loadMeta(id: string) {
  const meta = isPlaylistEntry(id)
    ? await fetchYoutubePlaylistOEmbed(fromPlaylistEntry(id))
    : await fetchYoutubeOEmbed(id)
  title.value = meta?.title ?? (isPlaylistEntry(id) ? 'Playlist' : 'Video')
  artist.value = meta?.authorName ?? 'YouTube'
}

watch(
  currentId,
  (id) => {
    if (!id) return
    if (isPlaylistEntry(id)) {
      yt.loadPlaylist(fromPlaylistEntry(id))
    } else {
      yt.loadVideo(id)
    }
    void loadMeta(id)
  },
  { immediate: true },
)

function next() {
  if (!props.videoIds.length) return
  if (currentId.value && isPlaylistEntry(currentId.value)) {
    yt.nextVideo()
    return
  }
  currentIndex.value = (currentIndex.value + 1) % props.videoIds.length
}
function prev() {
  if (!props.videoIds.length) return
  if (currentId.value && isPlaylistEntry(currentId.value)) {
    yt.previousVideo()
    return
  }
  currentIndex.value = (currentIndex.value - 1 + props.videoIds.length) % props.videoIds.length
}
function playAt(index: number) {
  currentIndex.value = index
  showList.value = false
}
</script>

<template>
  <div class="playlist-widget">
    <p class="playlist-heading">★ PLAYLIST ★</p>

    <div class="playlist-card">
      <div class="video-frame">
        <div id="yt-playlist-player-target" class="yt-target" />
      </div>

      <p class="pl-track-title">{{ title }}</p>
      <p class="pl-track-artist">{{ artist }}</p>

      <button type="button" class="pl-list-toggle" @click="showList = !showList">
        <span class="mdi mdi-music-note-eighth" />
        Playlist &middot; {{ videoIds.length }} {{ videoIds.length === 1 ? 'video' : 'videos' }}
      </button>

      <div v-if="showList" class="pl-list">
        <button
          v-for="(id, index) in videoIds"
          :key="id"
          type="button"
          class="pl-list-item"
          :class="{ 'pl-list-item--active': index === currentIndex }"
          @click="playAt(index)"
        >
          <img v-if="!isPlaylistEntry(id)" :src="youtubeThumbnail(id)" alt="" />
          <span v-else class="pl-list-item-playlist">
            <span class="mdi mdi-playlist-music" />
          </span>
        </button>
      </div>

      <div class="pl-controls">
        <button
          type="button"
          class="pl-btn"
          :disabled="videoIds.length < 2 && !(currentId && isPlaylistEntry(currentId))"
          @click="prev"
        >
          <span class="mdi mdi-skip-previous" />
          <span class="pl-btn-label">Anterior</span>
        </button>
        <button type="button" class="pl-btn pl-btn-main" @click="yt.toggle">
          <span class="mdi" :class="yt.playing.value ? 'mdi-pause' : 'mdi-play'" />
          <span class="pl-btn-label">{{ yt.playing.value ? 'Pausa' : 'Play' }}</span>
        </button>
        <button
          type="button"
          class="pl-btn"
          :disabled="videoIds.length < 2 && !(currentId && isPlaylistEntry(currentId))"
          @click="next"
        >
          <span class="mdi mdi-skip-next" />
          <span class="pl-btn-label">Siguiente</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-widget {
  width: 100%;
}

.playlist-heading {
  text-align: center;
  font-family: 'Chewy', 'Comic Neue', cursive;
  font-size: 1.3rem;
  margin: 0 0 8px;
  color: #ff1493;
  text-shadow:
    1px 1px 0 #fff,
    0 0 10px rgba(255, 20, 147, 0.5);
}

.playlist-card {
  padding: 12px;
  border-radius: 20px;
  background: linear-gradient(160deg, #ff6fb5, #d6006f 55%, #9e0057);
  border: 2px solid #fff;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    inset 0 -6px 10px rgba(0, 0, 0, 0.2),
    0 8px 20px rgba(214, 0, 111, 0.4);
}

.video-frame {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid #0a0f24;
  background: #000;
}

.yt-target,
.video-frame :deep(iframe) {
  width: 100%;
  height: 100%;
}

.video-frame :deep(iframe) {
  pointer-events: none;
}

.pl-track-title {
  margin: 8px 0 0;
  color: #fff;
  font-family: 'Chewy', cursive;
  font-size: 0.85rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-track-artist {
  margin: 2px 0 8px;
  color: #ffd1ea;
  font-size: 0.68rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-list-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.15);
  color: #fff59d;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.68rem;
  cursor: pointer;
}

.pl-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 8px;
  max-height: 180px;
  overflow-y: auto;
}
.pl-list-item {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  line-height: 0;
}
.pl-list-item img {
  width: 100%;
  display: block;
}
.pl-list-item-playlist {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-secondary));
  color: #fff;
  font-size: 18px;
}
.pl-list-item--active {
  border-color: #fff59d;
}

.pl-controls {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-top: 10px;
}
.pl-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 10px;
  border: 1px solid #6f8fe0;
  background: linear-gradient(180deg, #7fa2ff, #3a5bc7);
  color: #fff;
  font-family: 'Comic Neue', cursive;
  cursor: pointer;
}
.pl-btn-main {
  background: linear-gradient(180deg, #ff8fc9, #ff1493);
  border-color: #fff;
}
.pl-btn-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
}
.pl-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
