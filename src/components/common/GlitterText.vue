<script setup lang="ts">
withDefaults(defineProps<{ text: string; tagline?: string; sparkleCount?: number }>(), {
  sparkleCount: 10,
})

const SPARKLES = ['✦', '✧', '★', '☆', '✨']

function randomSparkle(seed: number) {
  return SPARKLES[seed % SPARKLES.length]
}
</script>

<template>
  <div class="glitter-title-wrap">
    <span v-for="n in sparkleCount" :key="n" class="sparkle" :style="{ '--i': n }">{{ randomSparkle(n) }}</span>
    <div class="glitter-title-inner">
      <h1 class="glitter-text">{{ text }}</h1>
      <p v-if="tagline" class="glitter-tagline">{{ tagline }}</p>
    </div>
  </div>
</template>

<style scoped>
.glitter-title-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 0.5rem;
}

.glitter-title-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glitter-text {
  font-family: 'Chewy', 'Comic Neue', cursive;
  font-size: clamp(3rem, 10vw, 5.5rem);
  text-align: center;
  margin: 0;
  background: linear-gradient(90deg, #ff1493, #ff69b4, #ba55d3, #00cfff, #ff1493);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.75);
  animation: shimmer 4s linear infinite;
  text-shadow: 0 4px 18px rgba(255, 20, 147, 0.45);
  letter-spacing: 2px;
}

.glitter-tagline {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: clamp(0.7rem, 1.6vw, 0.95rem);
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #9b30ff;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0.2rem 0 0;
}

@keyframes shimmer {
  to {
    background-position: 300% 0;
  }
}

.sparkle {
  position: absolute;
  font-size: 1.1rem;
  color: #fff59d;
  text-shadow: 0 0 6px #fff, 0 0 10px #ff69b4;
  animation: twinkle 1.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
  pointer-events: none;
}
/* Distribuye cada estrella en una posición distinta alrededor del título */
.sparkle:nth-child(1) { top: -6px; left: 4%; }
.sparkle:nth-child(2) { top: 10%; left: 14%; }
.sparkle:nth-child(3) { top: -10px; left: 26%; }
.sparkle:nth-child(4) { top: 60%; left: 2%; }
.sparkle:nth-child(5) { top: -4px; left: 42%; }
.sparkle:nth-child(6) { top: -8px; right: 40%; }
.sparkle:nth-child(7) { top: 55%; right: 2%; }
.sparkle:nth-child(8) { top: -6px; right: 24%; }
.sparkle:nth-child(9) { top: 12%; right: 12%; }
.sparkle:nth-child(10) { top: -10px; right: 3%; }

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.3) rotate(20deg); }
}
</style>
