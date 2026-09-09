<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CommentList from '@/components/comments/CommentList.vue'
import LikeButton from '@/components/likes/LikeButton.vue'
import PostAttachmentsList from '@/components/posts/PostAttachmentsList.vue'
import PostGallery from '@/components/posts/PostGallery.vue'
import { useSeo } from '@/composables/useSeo'
import { getPublishedPostBySlug } from '@/services/posts.service'
import type { Post } from '@/types'
import { formatDate } from '@/utils/date'

const props = defineProps<{ id: string }>()
const router = useRouter()

const post = ref<Post | null>(null)
const loading = ref(true)
const notFound = ref(false)

useSeo(() => ({
  title: post.value?.title ?? 'Publicación',
  description: post.value?.excerpt ?? '',
  image: post.value?.coverImageUrl ?? undefined,
}))

onMounted(async () => {
  loading.value = true
  try {
    const found = await getPublishedPostBySlug(props.id)
    if (!found) {
      notFound.value = true
      return
    }
    post.value = found
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <template v-if="loading">
      <v-skeleton-loader type="heading" class="mb-4" />
      <v-skeleton-loader type="image" height="360" class="mb-4" />
      <v-skeleton-loader type="paragraph" />
    </template>

    <template v-else-if="notFound">
      <v-alert type="warning" variant="tonal">Esta publicación no existe o no está disponible.</v-alert>
      <v-btn class="mt-4" variant="text" @click="router.push('/posts')">Volver a publicaciones</v-btn>
    </template>

    <article v-else-if="post">
      <v-chip size="small" color="secondary" variant="tonal" class="mb-3">{{ post.categoryName }}</v-chip>
      <h1 class="text-h4 font-weight-bold mb-2">{{ post.title }}</h1>
      <div class="d-flex align-center ga-3 text-body-2 text-medium-emphasis mb-6">
        <span>{{ post.authorName }}</span>
        <span>·</span>
        <span>{{ formatDate(post.publishedAt) }}</span>
      </div>

      <v-img
        v-if="post.coverImageUrl"
        :src="post.coverImageUrl"
        height="420"
        cover
        class="rounded-lg mb-6 bg-grey-lighten-3"
      />

      <div class="post-content text-body-1" v-html="post.content" />

      <div class="d-flex flex-wrap ga-2 mt-6">
        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined">#{{ tag }}</v-chip>
      </div>

      <PostGallery :images="post.gallery" />
      <PostAttachmentsList :attachments="post.attachments" />

      <div class="mt-8">
        <LikeButton :post-id="post.id" :likes-count="post.likesCount" />
      </div>

      <v-divider class="mt-8" />
      <CommentList :post-id="post.id" />
    </article>
  </div>
</template>

<style scoped>
.post-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
.post-content :deep(blockquote) {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
  margin: 1rem 0;
  padding-left: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.post-content :deep(pre) {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
}
.post-content :deep(p) {
  margin: 0 0 1rem;
}
</style>
