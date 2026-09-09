<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/common/EmptyState.vue'
import PostCardSkeleton from '@/components/common/PostCardSkeleton.vue'
import PostCard from '@/components/posts/PostCard.vue'
import PostFilters from '@/components/posts/PostFilters.vue'
import { useSeo } from '@/composables/useSeo'
import { listCategories } from '@/services/categories.service'
import { listPublishedPosts } from '@/services/posts.service'
import type { Category, Post } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const search = ref((route.query.q as string) ?? '')
const categoryId = ref<string | null>((route.query.category as string) ?? null)
const categories = ref<Category[]>([])

const posts = ref<Post[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
let lastDoc: QueryDocumentSnapshot | null = null

useSeo(() => ({
  title: 'Publicaciones',
  description: 'Explora todas las publicaciones del blog, filtra por categoría o búscalas por palabra clave.',
}))

const isSearching = computed(() => search.value.trim().length > 0)

async function loadCategories() {
  categories.value = await listCategories()
}

async function loadInitial() {
  loading.value = true
  lastDoc = null
  try {
    if (isSearching.value) {
      const term = search.value.trim().toLowerCase()
      const { posts: all } = await listPublishedPosts({ categoryId: categoryId.value ?? undefined, pageSize: 200 })
      posts.value = all.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.excerpt.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term)),
      )
      hasMore.value = false
    } else {
      const result = await listPublishedPosts({ categoryId: categoryId.value ?? undefined })
      posts.value = result.posts
      lastDoc = result.lastDoc
      hasMore.value = result.hasMore
    }
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const result = await listPublishedPosts({ categoryId: categoryId.value ?? undefined, cursor: lastDoc })
    posts.value.push(...result.posts)
    lastDoc = result.lastDoc
    hasMore.value = result.hasMore
  } finally {
    loadingMore.value = false
  }
}

watch([search, categoryId], () => {
  router.replace({ query: { q: search.value || undefined, category: categoryId.value || undefined } })
  loadInitial()
})

onMounted(() => {
  loadCategories()
  loadInitial()
})
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Publicaciones</h1>

    <PostFilters v-model:search="search" v-model:category-id="categoryId" :categories="categories" class="mb-8" />

    <template v-if="loading">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6">
          <PostCardSkeleton />
        </v-col>
      </v-row>
    </template>

    <EmptyState
      v-else-if="!posts.length"
      icon="mdi-magnify"
      title="No se encontraron publicaciones"
      message="Intenta con otra búsqueda o categoría."
    />

    <template v-else>
      <v-row>
        <v-col v-for="post in posts" :key="post.id" cols="12" sm="6">
          <PostCard :post="post" />
        </v-col>
      </v-row>

      <div v-if="hasMore" class="text-center mt-8">
        <v-btn variant="tonal" color="primary" :loading="loadingMore" @click="loadMore">
          Cargar más
        </v-btn>
      </div>
    </template>
  </div>
</template>
