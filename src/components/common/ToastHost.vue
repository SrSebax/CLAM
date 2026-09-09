<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const { visible, message, color } = storeToRefs(toast)
</script>

<template>
  <v-snackbar v-model="visible" :color="color" location="bottom right" timeout="4000">
    {{ message }}
  </v-snackbar>
</template>
