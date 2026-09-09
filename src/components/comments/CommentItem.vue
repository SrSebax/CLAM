<script setup lang="ts">
import type { Comment } from '@/types'
import { formatDate } from '@/utils/date'

defineProps<{ comment: Comment; canModerate: boolean }>()
defineEmits<{ delete: [comment: Comment] }>()
</script>

<template>
  <div class="d-flex ga-3 py-3">
    <v-avatar size="36" color="primary" variant="tonal">
      <v-img v-if="comment.userPhotoURL" :src="comment.userPhotoURL" />
      <span v-else>{{ comment.userName.charAt(0).toUpperCase() }}</span>
    </v-avatar>
    <div class="flex-grow-1">
      <div class="d-flex align-center ga-2">
        <span class="font-weight-medium">{{ comment.userName }}</span>
        <span class="text-caption text-medium-emphasis">{{ formatDate(comment.createdAt) }}</span>
      </div>
      <p class="text-body-2 mt-1 mb-0">{{ comment.text }}</p>
    </div>
    <v-btn
      v-if="canModerate"
      icon="mdi-delete-outline"
      size="small"
      variant="text"
      color="error"
      @click="$emit('delete', comment)"
    />
  </div>
</template>
