<script setup lang="ts">
import { onMounted, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import { deleteComment, listAllCommentsAdmin, setCommentStatus } from '@/services/comments.service'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import type { Comment } from '@/types'
import { formatDate } from '@/utils/date'
import { getFirestoreErrorMessage } from '@/utils/firestoreErrors'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const comments = ref<Comment[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    comments.value = await listAllCommentsAdmin()
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function toggleVisibility(comment: Comment) {
  const nextStatus = comment.status === 'visible' ? 'hidden' : 'visible'
  try {
    await setCommentStatus(comment, nextStatus)
    comment.status = nextStatus
    toast.success(nextStatus === 'hidden' ? 'Comentario ocultado.' : 'Comentario visible de nuevo.')
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudo actualizar el comentario.'))
  }
}

async function remove(comment: Comment) {
  const confirmed = await confirmStore.ask({
    title: 'Eliminar comentario',
    message: '¿Eliminar este comentario permanentemente?',
  })
  if (!confirmed) return

  try {
    await deleteComment(comment)
    comments.value = comments.value.filter((c) => c.id !== comment.id)
    toast.success('Comentario eliminado.')
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudo eliminar el comentario.'))
  }
}
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-6">Comentarios</h1>

    <v-skeleton-loader v-if="loading" type="table" />
    <EmptyState v-else-if="!comments.length" icon="mdi-comment-outline" title="No hay comentarios" />

    <v-table v-else>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Comentario</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in comments" :key="comment.id">
          <td>{{ comment.userName }}</td>
          <td style="max-width: 360px" class="text-truncate">{{ comment.text }}</td>
          <td>{{ formatDate(comment.createdAt) }}</td>
          <td>
            <v-chip size="small" :color="comment.status === 'visible' ? 'success' : 'warning'" variant="tonal">
              {{ comment.status === 'visible' ? 'Visible' : 'Oculto' }}
            </v-chip>
          </td>
          <td class="text-right">
            <v-btn
              :icon="comment.status === 'visible' ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              size="small"
              variant="text"
              @click="toggleVisibility(comment)"
            />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="remove(comment)" />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>
