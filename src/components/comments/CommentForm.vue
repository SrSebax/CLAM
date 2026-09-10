<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ submit: [name: string, text: string] }>()

const name = ref('')
const text = ref('')
const submitting = ref(false)

async function handleSubmit() {
  const trimmed = text.value.trim()
  if (!trimmed) return

  submitting.value = true
  try {
    emit('submit', name.value.trim(), trimmed)
    text.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field
      v-model="name"
      label="Nombre (opcional)"
      hide-details
      density="compact"
      class="mb-2"
    />
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
</template>
