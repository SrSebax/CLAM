<script setup lang="ts">
import type { Post } from '@/types'
import { formatDate } from '@/utils/date'

defineProps<{ post: Post }>()
</script>

<template>
  <v-card :to="`/post/${post.slug}`" elevation="1" class="h-100 d-flex flex-column post-card">
    <v-img
      :src="post.coverImageUrl ?? undefined"
      height="180"
      cover
      class="bg-grey-lighten-3"
    >
      <template v-if="!post.coverImageUrl" #placeholder>
        <div class="d-flex align-center justify-center h-100">
          <v-icon icon="mdi-image-outline" size="40" color="grey" />
        </div>
      </template>
    </v-img>

    <v-card-text class="d-flex flex-column flex-grow-1">
      <v-chip v-if="post.categoryName" size="small" color="secondary" variant="tonal" class="align-self-start mb-2">
        {{ post.categoryName }}
      </v-chip>

      <h3 class="text-h6 font-weight-bold mb-1 post-card-title">{{ post.title }}</h3>
      <p class="text-body-2 text-medium-emphasis flex-grow-1 post-card-excerpt">{{ post.excerpt }}</p>

      <div class="d-flex align-center justify-space-between mt-3 text-caption text-medium-emphasis">
        <span>{{ formatDate(post.publishedAt) }}</span>
        <div class="d-flex ga-3">
          <span><v-icon icon="mdi-heart" size="14" class="mr-1" />{{ post.likesCount }}</span>
          <span><v-icon icon="mdi-comment-outline" size="14" class="mr-1" />{{ post.commentsCount }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.post-card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-card-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
