<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: number | string
  color?: string
}>()
</script>

<template>
  <v-card elevation="1" class="pa-4">
    <div class="d-flex align-center ga-3">
      <v-avatar :color="color ?? 'primary'" variant="tonal" size="48">
        <v-icon :icon="icon" size="24" />
      </v-avatar>
      <div>
        <p class="text-h5 font-weight-bold mb-0">{{ value }}</p>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ label }}</p>
      </div>
    </div>
  </v-card>
</template>
