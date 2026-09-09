<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import { adjustCategoryPostCount } from '@/services/categories.service'
import { deletePostFile } from '@/services/storage.service'
import { deletePost, listAllPostsAdmin, updatePost } from '@/services/posts.service'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import type { Post, PostStatus } from '@/types'
import { formatDate } from '@/utils/date'
import { getFirestoreErrorMessage } from '@/utils/firestoreErrors'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const posts = ref<Post[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<PostStatus | 'all'>('all')

const filtered = computed(() => {
  return posts.value.filter((p) => {
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    const matchesSearch = p.title.toLowerCase().includes(search.value.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })
})

async function load() {
  loading.value = true
  try {
    posts.value = await listAllPostsAdmin()
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function toggleStatus(post: Post) {
  const nextStatus: PostStatus = post.status === 'published' ? 'draft' : 'published'
  try {
    await updatePost(
      post.id,
      {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        coverImagePath: post.coverImagePath,
        gallery: post.gallery,
        attachments: post.attachments,
        categoryId: post.categoryId,
        categoryName: post.categoryName,
        tags: post.tags,
        status: nextStatus,
        featured: post.featured,
      },
      post.status === 'published',
    )
    post.status = nextStatus
    toast.success(nextStatus === 'published' ? 'Publicación publicada.' : 'Publicación pasada a borrador.')
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudo cambiar el estado.'))
  }
}

async function remove(post: Post) {
  const confirmed = await confirmStore.ask({
    title: 'Eliminar publicación',
    message: `¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`,
  })
  if (!confirmed) return

  try {
    await deletePost(post.id)
    await adjustCategoryPostCount(post.categoryId, -1)
    const filesToDelete = [post.coverImagePath, ...post.gallery.map((g) => g.path), ...post.attachments.map((a) => a.path)]
    await Promise.all(filesToDelete.filter((p): p is string => !!p).map((p) => deletePostFile(p)))
    posts.value = posts.value.filter((p) => p.id !== post.id)
    toast.success('Publicación eliminada.')
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudo eliminar la publicación.'))
  }
}
</script>

<template>
  <v-container class="py-8">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
      <h1 class="text-h4 font-weight-bold">Publicaciones</h1>
      <v-btn to="/admin/posts/new" color="primary" prepend-icon="mdi-plus">Nueva publicación</v-btn>
    </div>

    <div class="d-flex flex-column flex-sm-row ga-3 mb-6">
      <v-text-field v-model="search" label="Buscar por título" prepend-inner-icon="mdi-magnify" hide-details clearable />
      <v-select
        v-model="statusFilter"
        :items="[
          { title: 'Todos', value: 'all' },
          { title: 'Publicados', value: 'published' },
          { title: 'Borradores', value: 'draft' },
        ]"
        label="Estado"
        hide-details
        style="min-width: 200px"
      />
    </div>

    <v-skeleton-loader v-if="loading" type="table" />

    <EmptyState v-else-if="!filtered.length" icon="mdi-post-outline" title="No hay publicaciones" />

    <v-table v-else>
      <thead>
        <tr>
          <th>Título</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Likes</th>
          <th>Comentarios</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in filtered" :key="post.id">
          <td>{{ post.title }}</td>
          <td>{{ post.categoryName }}</td>
          <td>
            <v-chip
              size="small"
              :color="post.status === 'published' ? 'success' : 'warning'"
              variant="tonal"
              class="cursor-pointer"
              @click="toggleStatus(post)"
            >
              {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
            </v-chip>
          </td>
          <td>{{ formatDate(post.updatedAt) }}</td>
          <td>{{ post.likesCount }}</td>
          <td>{{ post.commentsCount }}</td>
          <td class="text-right">
            <v-btn :to="`/admin/posts/${post.id}/edit`" icon="mdi-pencil-outline" size="small" variant="text" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="remove(post)" />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
