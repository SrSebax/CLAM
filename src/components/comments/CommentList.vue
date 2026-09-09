<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { addComment, deleteComment, listVisibleComments } from '@/services/comments.service'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import type { Comment } from '@/types'

import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'

const props = defineProps<{ postId: string }>()

const auth = useAuthStore()
const confirmStore = useConfirmStore()
const toast = useToastStore()

const comments = ref<Comment[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    comments.value = await listVisibleComments(props.postId)
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function handleSubmit(text: string) {
  if (!auth.user) return
  try {
    await addComment(props.postId, auth.user.uid, auth.displayName, auth.user.photoURL, text)
    await load()
    toast.success('Comentario publicado.')
  } catch {
    toast.error('No se pudo publicar el comentario.')
  }
}

async function handleDelete(comment: Comment) {
  const confirmed = await confirmStore.ask({
    title: 'Eliminar comentario',
    message: '¿Eliminar este comentario? Esta acción no se puede deshacer.',
  })
  if (!confirmed) return

  try {
    await deleteComment(comment)
    comments.value = comments.value.filter((c) => c.id !== comment.id)
    toast.success('Comentario eliminado.')
  } catch {
    toast.error('No se pudo eliminar el comentario.')
  }
}
</script>

<template>
  <div class="mt-8">
    <h2 class="text-h6 font-weight-bold mb-3">Comentarios ({{ comments.length }})</h2>

    <CommentForm @submit="handleSubmit" />

    <div v-if="loading" class="py-4">
      <v-skeleton-loader type="list-item-avatar-two-line" />
      <v-skeleton-loader type="list-item-avatar-two-line" />
    </div>

    <p v-else-if="!comments.length" class="text-body-2 text-medium-emphasis mt-4">
      Aún no hay comentarios. ¡Sé el primero en comentar!
    </p>

    <v-divider v-if="comments.length" class="mt-4" />
    <template v-for="(comment, index) in comments" :key="comment.id">
      <CommentItem :comment="comment" :can-moderate="auth.isAdmin" @delete="handleDelete" />
      <v-divider v-if="index < comments.length - 1" />
    </template>
  </div>
</template>
