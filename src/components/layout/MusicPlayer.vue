<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useYoutubePlayer } from '@/composables/useYoutubePlayer'
import { formatTime } from '@/utils/formatTime'
import { fetchYoutubeOEmbed } from '@/utils/youtube'

const props = defineProps<{ videoIds: string[] }>()

const currentIndex = ref(0)
const currentId = computed(() => props.videoIds[currentIndex.value] ?? null)

const yt = useYoutubePlayer('yt-music-player-target', () => next())

const title = ref('')
const artist = ref('')

async function loadMeta(id: string) {
  const meta = await fetchYoutubeOEmbed(id)
  title.value = meta?.title ?? 'Canción'
  artist.value = meta?.authorName ?? 'YouTube'
}

watch(
  currentId,
  (id) => {
    if (!id) return
    yt.loadVideo(id)
    void loadMeta(id)
  },
  { immediate: true },
)

function next() {
  if (!props.videoIds.length) return
  currentIndex.value = (currentIndex.value + 1) % props.videoIds.length
}
function prev() {
  if (!props.videoIds.length) return
  currentIndex.value = (currentIndex.value - 1 + props.videoIds.length) % props.videoIds.length
}

const progressPercent = computed(() => (yt.duration.value > 0 ? (yt.currentTime.value / yt.duration.value) * 100 : 0))

function handleBarClick(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  yt.seekTo(ratio * yt.duration.value)
}
</script>

<template>
  <div class="ipod">
    <div v-show="false" id="yt-music-player-target" />

    <div class="ipod-body">
      <div class="ipod-screen">
        <div class="note-circle">
          <span class="mdi mdi-music-note note-icon" :class="{ spin: yt.playing.value }" />
        </div>
        <p class="track-title">{{ title }}</p>
        <p class="track-artist">{{ artist }}</p>

        <div class="progress-bar" @click="handleBarClick">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          <div class="progress-dot" :style="{ left: progressPercent + '%' }" />
        </div>
        <div class="time-row">
          <span>{{ formatTime(yt.currentTime.value) }}</span>
          <span>{{ formatTime(yt.duration.value) }}</span>
        </div>

        <div class="mini-controls">
          <button type="button" class="mini-btn" :disabled="videoIds.length < 2" @click="prev">
            <span class="mdi mdi-skip-previous" />
          </button>
          <button type="button" class="mini-btn" @click="yt.toggle">
            <span class="mdi" :class="yt.playing.value ? 'mdi-pause' : 'mdi-play'" />
          </button>
          <button type="button" class="mini-btn" :disabled="videoIds.length < 2" @click="next">
            <span class="mdi mdi-skip-next" />
          </button>
        </div>
      </div>

      <div class="wheel">
        <span class="wheel-label wheel-label-top">MENU</span>
        <span class="wheel-label wheel-label-bottom">VOL</span>
        <button type="button" class="wheel-icon-btn wheel-icon-left" :disabled="videoIds.length < 2" @click="prev">
          <span class="mdi mdi-chevron-left" />
        </button>
        <button type="button" class="wheel-icon-btn wheel-icon-right" :disabled="videoIds.length < 2" @click="next">
          <span class="mdi mdi-chevron-right" />
        </button>
        <button type="button" class="wheel-center" @click="yt.toggle">
          <span class="mdi" :class="yt.playing.value ? 'mdi-pause' : 'mdi-play'" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ipod {
  position: fixed;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
}
.ipod-body {
  width: 168px;
  padding: 14px 12px 18px;
  border-radius: 26px;
  background: linear-gradient(135deg, #ff6fb5, #d6006f 55%, #9e0057);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.6),
    inset 0 -6px 10px rgba(0, 0, 0, 0.25),
    0 8px 20px rgba(214, 0, 111, 0.45);
  border: 2px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ipod-screen {
  width: 100%;
  background: radial-gradient(circle at 50% 20%, #1c2b52, #0a0f24 80%);
  border: 3px solid #0a0f24;
  border-radius: 12px;
  padding: 10px 8px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
}

.note-circle {
  width: 56px;
  height: 56px;
  margin: 4px auto 8px;
  border-radius: 50%;
  border: 2px solid #4d7dff;
  box-shadow: 0 0 10px #4d7dff, inset 0 0 10px rgba(77, 125, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.note-icon {
  font-size: 26px;
  color: #ffb300;
}
.note-icon.spin {
  animation: bob 1s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.track-title {
  margin: 0;
  color: #fff;
  font-family: 'Chewy', cursive;
  font-size: 0.8rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.track-artist {
  margin: 2px 0 8px;
  color: #9db4ff;
  font-size: 0.68rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  cursor: pointer;
  margin: 0 2px;
}
.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: #ff1493;
  border-radius: 999px;
}
.progress-dot {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  background: #ff1493;
  border: 1px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.time-row {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 0.6rem;
  margin-top: 4px;
  padding: 0 2px;
}

.mini-controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}
.mini-btn {
  width: 30px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #6f8fe0;
  background: linear-gradient(180deg, #7fa2ff, #3a5bc7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mini-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.wheel {
  position: relative;
  width: 148px;
  height: 148px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #ede8e8 60%, #cfcfcf);
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.9), 0 3px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.wheel-label {
  position: absolute;
  font-family: 'Chewy', cursive;
  font-size: 0.7rem;
  color: #555;
  letter-spacing: 1px;
}
.wheel-label-top {
  top: 14px;
}
.wheel-label-bottom {
  bottom: 14px;
}
.wheel-icon-btn {
  position: absolute;
  background: none;
  border: none;
  font-size: 20px;
  color: #777;
  cursor: pointer;
  display: flex;
}
.wheel-icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.wheel-icon-left {
  left: 16px;
}
.wheel-icon-right {
  right: 16px;
}
.wheel-center {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: none;
  background: radial-gradient(circle at 35% 30%, #ff6fb5, #d6006f);
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.6), 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
