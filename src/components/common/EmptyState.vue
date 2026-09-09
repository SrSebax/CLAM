<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    message?: string
  }>(),
  { icon: 'mdi-file-document-outline', message: '' },
)
</script>

<template>
  <div class="d-flex flex-column align-center justify-center text-center py-12 px-4">
    <v-icon :icon="icon" size="56" color="medium-emphasis" class="mb-4" />
    <p class="text-h6 mb-1">{{ title }}</p>
    <p v-if="message" class="text-body-2 text-medium-emphasis">{{ message }}</p>
    <slot />
  </div>
</template>
