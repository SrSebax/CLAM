<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ submit: [text: string] }>()

const auth = useAuthStore()
const router = useRouter()
const text = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  const trimmed = text.value.trim()
  if (!trimmed) return

  submitting.value = true
  try {
    emit('submit', trimmed)
    text.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-form v-if="auth.isAuthenticated" @submit.prevent="handleSubmit">
    <v-textarea
      v-model="text"
      label="Escribe un comentario..."
      rows="2"
      auto-grow
      hide-details
      class="mb-2"
    />
    <v-btn type="submit" color="primary" :loading="submitting" :disabled="!text.trim()">
      Comentar
    </v-btn>
  </v-form>
  <v-alert v-else type="info" variant="tonal">
    <RouterLink :to="{ name: 'login' }" class="font-weight-medium">Inicia sesión</RouterLink>
    para dejar un comentario.
  </v-alert>
</template>
