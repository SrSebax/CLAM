<script setup lang="ts">
import { ref } from 'vue'

import { deletePostFile, uploadPostFile, type UploadKind } from '@/services/storage.service'
import { useToastStore } from '@/stores/toast'
import type { PostAttachment } from '@/types'

const props = defineProps<{
  postId: string
  modelValue: PostAttachment[]
  kind: UploadKind
  accept: string
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: PostAttachment[]] }>()

const toast = useToastStore()
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function handleFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (files.length === 0) return

  uploading.value = true
  try {
    const uploaded: PostAttachment[] = []
    for (const file of files) {
      uploaded.push(await uploadPostFile(props.postId, props.kind, file))
    }
    emit('update:modelValue', [...props.modelValue, ...uploaded])
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'No se pudo subir el archivo.')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function remove(item: PostAttachment) {
  await deletePostFile(item.path)
  emit(
    'update:modelValue',
    props.modelValue.filter((f) => f.path !== item.path),
  )
}
</script>

<template>
  <div>
    <p class="text-subtitle-2 mb-2">{{ label }}</p>
    <v-list v-if="modelValue.length" density="compact" class="mb-2">
      <v-list-item v-for="item in modelValue" :key="item.path" :title="item.name">
        <template #prepend>
          <v-icon icon="mdi-paperclip" />
        </template>
        <template #append>
          <v-btn icon="mdi-close" size="small" variant="text" @click="remove(item)" />
        </template>
      </v-list-item>
    </v-list>
    <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" :loading="uploading" @click="fileInput?.click()">
      Adjuntar archivos
    </v-btn>
    <input ref="fileInput" type="file" :accept="accept" multiple hidden @change="handleFiles" />
  </div>
</template>
