<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{ label: string }>()
</script>

<template>
  <div class="d-flex align-center ga-3">
    <input v-model="model" type="color" class="color-swatch" :aria-label="label" />
    <v-text-field v-model="model" :label="label" hide-details density="comfortable" />
  </div>
</template>

<style scoped>
.color-swatch {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
