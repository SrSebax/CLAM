<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getAnonId } from '@/composables/useAnonId'
import { addLike, hasLiked, removeLike } from '@/services/likes.service'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  postId: string
  likesCount: number
}>()

const toast = useToastStore()

const liked = ref(false)
const count = ref(props.likesCount)
const loading = ref(false)

onMounted(async () => {
  liked.value = await hasLiked(props.postId, getAnonId())
})

async function toggle() {
  loading.value = true
  try {
    const anonId = getAnonId()
    if (liked.value) {
      await removeLike(props.postId, anonId)
      liked.value = false
      count.value -= 1
    } else {
      await addLike(props.postId, anonId)
      liked.value = true
      count.value += 1
    }
  } catch {
    toast.error('No se pudo registrar el Like. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-btn
    :color="liked ? 'secondary' : undefined"
    :variant="liked ? 'flat' : 'outlined'"
    :loading="loading"
    :prepend-icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
    @click="toggle"
  >
    {{ count }} {{ count === 1 ? 'Like' : 'Likes' }}
  </v-btn>
</template>
