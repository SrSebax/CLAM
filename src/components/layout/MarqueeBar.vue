<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <div v-if="text" class="marquee-bar">
    <div class="marquee-track">
      <span class="marquee-item">{{ text }}</span>
      <span class="marquee-item">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.marquee-bar {
  overflow: hidden;
  white-space: nowrap;
  background: repeating-linear-gradient(45deg, #ff1493, #ff1493 10px, #ba55d3 10px, #ba55d3 20px);
  color: #fff;
  font-family: 'Chewy', cursive;
  font-size: 0.95rem;
  padding: 6px 0;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.25);
}
.marquee-track {
  display: inline-flex;
  animation: scroll-left 18s linear infinite;
}
.marquee-item {
  padding-right: 3rem;
}
@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
