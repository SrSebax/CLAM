<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { addLike, hasLiked, removeLike } from '@/services/likes.service'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  postId: string
  likesCount: number
}>()

const auth = useAuthStore()
const router = useRouter()
const toast = useToastStore()

const liked = ref(false)
const count = ref(props.likesCount)
const loading = ref(false)

onMounted(async () => {
  if (auth.isAuthenticated && auth.user) {
    liked.value = await hasLiked(props.postId, auth.user.uid)
  }
})

async function toggle() {
  if (!auth.isAuthenticated || !auth.user) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  loading.value = true
  try {
    if (liked.value) {
      await removeLike(props.postId, auth.user.uid)
      liked.value = false
      count.value -= 1
    } else {
      await addLike(props.postId, auth.user.uid)
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
