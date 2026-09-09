<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PostCard from '@/components/posts/PostCard.vue'
import PostCardSkeleton from '@/components/common/PostCardSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useSeo } from '@/composables/useSeo'
import { getFeaturedPost, listRecentPublishedPosts } from '@/services/posts.service'
import type { Post } from '@/types'
import { formatDate } from '@/utils/date'

const router = useRouter()

const featured = ref<Post | null>(null)
const recent = ref<Post[]>([])
const loading = ref(true)
const searchQuery = ref('')

useSeo(() => ({
  title: 'Inicio',
  description: 'CLAM — un blog moderno para leer, compartir y comentar historias.',
  image: featured.value?.coverImageUrl ?? undefined,
}))

onMounted(async () => {
  loading.value = true
  try {
    const [featuredPost, recentPosts] = await Promise.all([
      getFeaturedPost(),
      listRecentPublishedPosts(6),
    ])
    featured.value = featuredPost
    recent.value = recentPosts.filter((p) => p.id !== featuredPost?.id)
  } finally {
    loading.value = false
  }
})

function runSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'posts-list', query: { q: searchQuery.value.trim() } })
}
</script>

<template>
  <div>
    <section class="hero-section pa-6 mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Historias que vale la pena leer</h1>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Un espacio para publicar, descubrir y conversar sobre las ideas que importan.
      </p>
      <v-text-field
        v-model="searchQuery"
        placeholder="Buscar publicaciones..."
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        hide-details
        @keyup.enter="runSearch"
      />
    </section>

    <template v-if="loading">
        <v-row>
          <v-col v-for="n in 3" :key="n" cols="12" sm="6">
            <PostCardSkeleton />
          </v-col>
        </v-row>
      </template>

      <template v-else>
        <div v-if="featured" class="mb-10">
          <h2 class="text-h5 font-weight-bold mb-4">Publicación destacada</h2>
          <v-card :to="`/post/${featured.slug}`" elevation="2" class="featured-card">
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-img
                  :src="featured.coverImageUrl ?? undefined"
                  height="320"
                  cover
                  class="bg-grey-lighten-3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-card-text class="pa-6 d-flex flex-column h-100">
                  <v-chip size="small" color="secondary" variant="tonal" class="align-self-start mb-3">
                    {{ featured.categoryName }}
                  </v-chip>
                  <h3 class="text-h5 font-weight-bold mb-2">{{ featured.title }}</h3>
                  <p class="text-body-1 text-medium-emphasis flex-grow-1">{{ featured.excerpt }}</p>
                  <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-4">
                    <span>{{ formatDate(featured.publishedAt) }}</span>
                    <div class="d-flex ga-3">
                      <span><v-icon icon="mdi-heart" size="14" class="mr-1" />{{ featured.likesCount }}</span>
                      <span
                        ><v-icon icon="mdi-comment-outline" size="14" class="mr-1" />{{
                          featured.commentsCount
                        }}</span
                      >
                    </div>
                  </div>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <h2 class="text-h5 font-weight-bold mb-4">Últimas publicaciones</h2>
        <EmptyState
          v-if="!recent.length"
          icon="mdi-post-outline"
          title="Aún no hay publicaciones"
          message="Vuelve pronto para ver nuevo contenido."
        />
        <v-row v-else>
          <v-col v-for="post in recent" :key="post.id" cols="12" sm="6">
            <PostCard :post="post" />
          </v-col>
        </v-row>

        <div class="text-center mt-8">
          <v-btn to="/posts" variant="tonal" color="primary" size="large">Ver todas las publicaciones</v-btn>
        </div>
      </template>
  </div>
</template>

<style scoped>
.hero-section {
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}
.featured-card :deep(.v-img) {
  height: 100%;
}
</style>
